import Stripe from "stripe";
import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { ERROR_CODES } from "../../../shared/utils/type";
import { Payment } from "../../../domain/entities/payment.entity";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { notificationContentMap } from "../../../shared/utils/constants";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { CreateBookingPaymentSuccessEvent, EventEnvelope } from "../../dtos/kafka.dtos";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { PaymentFor, PaymentGateway, PaymentMethod, PaymentStatus } from "../../../domain/enums/payment.enum";

export class BookingCheckoutCompleteUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly paymentGateway: IPaymentGateway
    ) { }

    async execute(payload: Stripe.Checkout.Session): Promise<void> {
        try {
            if (!payload.payment_intent) {
                throw new BadRequestError();
            }

            let receiptUrl: string | null = null;
            let receiptNumber: string | null = null;
            let receiptEmail: string | null = null;

            const paymentIntentDetail = await this.paymentGateway.retrievePaymentIntent({
                paymentIntent: payload.payment_intent as string
            });
            const latestCharge = paymentIntentDetail.paymentIntent.latest_charge as Stripe.Charge;
            if (!latestCharge || !latestCharge.balance_transaction) {
                throw new AppError(
                    "Payment charge or balance transaction details missing",
                    500,
                    false,
                    ERROR_CODES.PAYMENT_INVALID_RESPONSE
                );
            }

            receiptUrl = latestCharge.receipt_url;
            receiptNumber = latestCharge.receipt_number;
            receiptEmail = latestCharge.receipt_email;

            const balanceTransaction = await this.paymentGateway.retrieveBalance({
                balanceTransaction: latestCharge.balance_transaction as string
            });
            const fee = balanceTransaction.balanceTransaction.fee;


            const userId = payload?.metadata?.userId;
            const bookingId = payload?.metadata?.bookingId;
            const email = payload?.metadata?.userEmail;
            const slotDuration = payload?.metadata?.slotDuration;
            const name = payload?.metadata?.userName;
            const providerId = payload?.metadata?.providerId;
            const initialAmount = Number(payload?.metadata?.initialAmount);
            const selectedServiceMode = payload?.metadata?.selectedServiceMode;
            const paymentFor = payload?.metadata?.paymentFor as PaymentFor;
            const pushNotification = Boolean(payload?.metadata?.pushNotification);
            const paymentIntent = payload?.payment_intent as string;
            const paymentMethod = payload?.payment_method_types[0] as PaymentMethod;
            const paymentStatus = payload?.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING;
            const totalAmount = (payload.amount_total || 0) / 100;
            const discountAmount = (payload.total_details?.amount_discount || 0) / 100;

            if (!providerId ||
                !userId ||
                !selectedServiceMode ||
                !initialAmount ||
                !totalAmount ||
                !paymentStatus ||
                !paymentMethod ||
                !paymentIntent ||
                !slotDuration ||
                !bookingId ||
                !email ||
                !name
            ) {
                throw new BadRequestError();
            }

            const paymentData = Payment.createForBooking({
                idempotencyKey: uuidv4(),
                paymentIntentId: paymentIntent,
                gatewayFee: fee,
                transactionId: uuidv4(),
                paymentStatus,
                paymentMethod,
                paymentGateway: PaymentGateway.STRIPE,
                paymentFor,
                initialAmount,
                discountAmount,
                totalAmount,
                providerId,
                userId,
                chargeId: payload.payment_intent as string,
                receiptUrl,
                receiptNumber,
                receiptEmail,
                customerEmail: payload.customer_details?.email || email,
                description: payload.metadata?.description,
            });

            const payment = await this.paymentRepository.create(paymentData);

            if (payment) {
                await this.kafkaProducer.publish<EventEnvelope<CreateBookingPaymentSuccessEvent>>(
                    kafkaConfig.topics.pub.userBookingPaymentSuccess,
                    {
                        eventId: uuidv4(),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toString(),
                        payload: {
                            mbsData: {
                                bookingId,
                                paymentId: payment._id,
                            },
                            emailData: {
                                email,
                                name,
                                totalAmount,
                                paymentDate: payment.createdAt,
                                paymentStatus,
                                receiptUrl,
                                transactionId: paymentIntent,
                                paymentFor,
                            },
                            notificationData: {
                                userId,
                                pushNotification,
                                title: notificationContentMap.bookingPaymentSuccess.title,
                                body: notificationContentMap.bookingPaymentSuccess.body(),
                            },
                        },
                    }
                );
            } else {
               throw new AppError(
                "Failed to create payment",
                500,
                false,
                ERROR_CODES.PAYMENT_SERVICE_ERROR
               )
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to booking checkout");
        }
    }
}