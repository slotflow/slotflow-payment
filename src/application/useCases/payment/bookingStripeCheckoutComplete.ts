import Stripe from "stripe";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { log } from "../../../shared/logger/logger";
import { stripe } from "../../../infrastructure/lib/stripe";
import { Payment } from "../../../domain/entities/payment.entity";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../../../domain/enums/payment.enum";
import { kafkaConfig } from "../../../config/env";
import { v4 as uuidv4 } from 'uuid';
import { CreateBookingPaymentFailedEvent, CreateBookingPaymentSuccessEvent, EventEnvelope } from "../../dtos/kafka.dtos";
import { notificationContentMap } from "../../../shared/utils/constants";

export class BookingStripeCheckoutCompleteUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { }

    async execute(payload: Stripe.Checkout.Session): Promise<void> {
        try {
            log.info(`Payload : ${JSON.stringify(payload)}`);

            let receiptUrl = null;
            let receiptNumber = null;
            let receiptEmail = null;

            if (payload.payment_intent) {
                const paymentIntent = await stripe.paymentIntents.retrieve(payload.payment_intent as string, {
                    expand: ['latest_charge']
                });
                const latestCharge = paymentIntent.latest_charge as Stripe.Charge;
                if (latestCharge) {
                    receiptUrl = latestCharge.receipt_url;
                    receiptNumber = latestCharge.receipt_number;
                    receiptEmail = latestCharge.receipt_email;
                }
            }

            const providerId = payload?.metadata?.providerId;
            const selectedDay = payload?.metadata?.selectedDay;
            const slotId = payload?.metadata?.slotId;
            const selectedServiceMode = payload?.metadata?.selectedServiceMode;
            const paymentStatus = payload?.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING;
            const paymentMethod = payload?.payment_method_types[0];
            const dateString = payload?.metadata?.appointmentDate;
            const paymentIntent = payload?.payment_intent as string;
            const slotDuration = payload?.metadata?.slotDuration;
            const paymentFor = payload?.metadata?.paymentFor as PaymentFor;
            const bookingId = payload?.metadata?.bookingId;
            const email = payload?.metadata?.userEmail;
            const name = payload?.metadata?.userName;
            const initialAmount = Number(payload?.metadata?.initialAmount);
            const totalAmount = (payload.amount_total || 0) / 100;
            const discountAmount = (payload.total_details?.amount_discount || 0) / 100;
            const pushNotification = Boolean(payload?.metadata?.pushNotification);

            if(!providerId ||
                !slotId ||
                !selectedDay ||
                !selectedServiceMode ||
                !initialAmount ||
                !totalAmount ||
                !paymentStatus ||
                !paymentMethod ||
                !dateString ||
                !paymentIntent ||
                !slotDuration ||
                !bookingId ||
                !email ||
                !name
            ){
                throw new Error("Missing required metadata");
            }


            const paymentData = Payment.createForBooking({
                transactionId: paymentIntent,
                paymentStatus,
                paymentMethod,
                paymentGateway: PaymentGateway.STRIPE,
                paymentFor,
                initialAmount,
                discountAmount,
                totalAmount,
                providerId,
                chargeId: payload.payment_intent as string,
                receiptUrl,
                receiptNumber,
                receiptEmail,
                customerEmail: payload.customer_details?.email || email,
                description: payload.metadata?.description,
            });

            const payment = await this.paymentRepository.create(paymentData);

            if(payment) {
                await this.kafkaProducer.publish<EventEnvelope<CreateBookingPaymentSuccessEvent>>(
                    kafkaConfig.topics.pub.bookingPaymentSuccess,
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
                            userId: providerId,
                            pushNotification,
                            title: notificationContentMap.bookingPaymentSuccess.title,
                            body: notificationContentMap.bookingPaymentSuccess.body(),
                        },
                    },
                }
            );

        } else {
                await this.kafkaProducer.publish<EventEnvelope<CreateBookingPaymentFailedEvent>>(
                    kafkaConfig.topics.pub.bookingPaymentFailed,
                    {
                        eventId: uuidv4(),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toString(),
                        payload: {
                            mbsData: {
                               bookingId,
                            },
                        },
                    }
                );
            }
        } catch (error) {
            log.error("BookingStripeCheckoutCompleteUseCase failed : ", error as Error);
            throw error;
        }
    }
}