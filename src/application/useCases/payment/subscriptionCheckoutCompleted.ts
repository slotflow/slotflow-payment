import Stripe from "stripe";
import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { ERROR_CODES } from "../../../shared/utils/type";
import { Payment } from "../../../domain/entities/payment.entity";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { notificationContentMap } from "../../../shared/utils/constants";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { PaymentFor, PaymentGateway, PaymentMethod, PaymentStatus } from "../../../domain/enums/payment.enum";
import { EventEnvelope, ProviderCreatePaymentSuccessEvent } from "../../dtos/kafka.dtos";

export class SubscriptionCheckoutCompleteUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly paymentGateway: IPaymentGateway,
    ) { };

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

            if (!paymentIntentDetail.paymentIntent.latest_charge) {
                throw new BadRequestError("Payment charge details missing");
            }

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

            const subscriptionId = payload?.metadata?.subscriptionId;
            const providerId = payload?.metadata?.providerId;
            const planDuration = Number(payload?.metadata?.planDuration);
            const paymentStatus = payload?.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING;
            const paymentIntent = payload?.payment_intent as string;
            const paymentMethod = payload?.payment_method_types[0] as PaymentMethod;
            const paymentFor = payload?.metadata?.paymentFor as PaymentFor;
            const name = payload?.metadata?.name;
            const email = payload?.metadata?.email;
            const initialAmount = Number(payload?.metadata?.initialAmount);
            const totalAmount = (payload.amount_total || 0) / 100;
            const discountAmount = (payload.total_details?.amount_discount || 0) / 100;

            if (!planDuration ||
                !email ||
                !name ||
                !paymentIntent ||
                !paymentFor ||
                !subscriptionId
            ) {
                throw new BadRequestError();
            }

            if (!providerId) {
                throw new BadRequestError("Provider ID must be provided");
            }

            const paymentData = Payment.createForSubscription({
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
                providerId: providerId,
                chargeId: payload.payment_intent as string,
                receiptUrl,
                receiptNumber,
                receiptEmail,
                customerEmail: payload.customer_details?.email || email,
                description: payload.metadata?.description || `Subscription for ${name}`,
            });

            const payment = await this.paymentRepository.create(paymentData);

            if (payment) {
                await this.kafkaProducer.publish<EventEnvelope<ProviderCreatePaymentSuccessEvent>>(
                    kafkaConfig.topics.pub.providerSubscriptionPaymentSuccess,
                    {
                        eventId: uuidv4(),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toString(),
                        payload: {
                            mbsData: {
                                subscriptionId,
                                paymentId: payment._id,
                                planDuration,
                                providerId: providerId
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
                                userId: providerId,
                                pushNotification: false,
                                title: notificationContentMap.providerSubscriptionPayment.title,
                                body: notificationContentMap.providerSubscriptionPayment.body(),
                            },
                        },
                    },
                )
            } else {
                throw new AppError(
                    "Failed to save payment",
                    500,
                    false,
                    ERROR_CODES.PAYMENT_SERVICE_ERROR
                )
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get provider revenue");
        };
    };
};