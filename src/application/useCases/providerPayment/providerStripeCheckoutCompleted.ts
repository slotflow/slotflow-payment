import Stripe from "stripe";
import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { Payment } from "../../../domain/entities/payment.entity";
import { notificationContentMap } from "../../../shared/utils/constants";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../../../domain/enums/payment.enum";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { EventEnvelope, ProviderCreatePaymentFailedEvent, ProviderCreatePaymentSuccessEvent } from "../../dtos/kafka.dtos";
import { stripe } from "../../../infrastructure/lib/stripe";

export class ProviderStripeCheckoutCompleteUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
    ) { };

    async execute(payload: Stripe.Checkout.Session): Promise<void> {

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

        const subscriptionId = payload?.metadata?.subscriptionId;
        const providerId = payload?.metadata?.providerId;
        const planDuration = Number(payload?.metadata?.planDuration);
        const paymentStatus = payload?.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING;
        const paymentIntent = payload?.payment_intent as string;
        const paymentMethod = payload?.payment_method_types[0];
        const paymentFor = payload?.metadata?.paymentFor as PaymentFor;
        const paymentDate = payload?.metadata?.paymentDate;
        const name = payload?.metadata?.name;
        const email = payload?.metadata?.email;
        const initialAmount = Number(payload?.metadata?.initialAmount);
        const totalAmount = (payload.amount_total || 0) / 100;
        const discountAmount = (payload.total_details?.amount_discount || 0) / 100;

        console.log("subscriptionId : ", subscriptionId);
        console.log("providerId : ", providerId);
        console.log("paymentStatus : ", paymentStatus);
        console.log("planDuration : ", planDuration);
        console.log("paymentIntent : ", paymentIntent);
        console.log("paymentMethod : ", paymentMethod);
        console.log("paymentFor : ", paymentFor);
        console.log("paymentDate : ", paymentDate);
        console.log("name : ", name);
        console.log("email : ", email);
        console.log("initialAmount : ", initialAmount);
        console.log("totalAmount : ", totalAmount);
        console.log("discountAmount : ", discountAmount);

        if (!planDuration ||
            !email ||
            !name ||
            !paymentDate ||
            !paymentIntent ||
            !paymentFor ||
            !subscriptionId ||
            !providerId) {
            return;
        };

        try {

            const paymentData = Payment.createForSubscription({
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
                description: payload.metadata?.description || `Subscription for ${name}`,
            });

            const payment = await this.paymentRepository.create(paymentData);

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
                            providerId
                        },
                        emailData: {
                            email,
                            name,
                            totalAmount,
                            paymentDate,
                            paymentStatus,
                            receiptUrl,
                            transactionId: paymentIntent,
                            paymentFor,
                        },
                        notificationData: {
                            userId: providerId,
                            pushNotification: false,
                            title: notificationContentMap.providerSubscriptionPayment.title,
                            body: notificationContentMap.providerSubscriptionPayment.body(planDuration),
                        },
                    },
                },
            );
        } catch (error) {
            await this.kafkaProducer.publish<EventEnvelope<ProviderCreatePaymentFailedEvent>>(
                kafkaConfig.topics.pub.providerSubscriptionPaymentFailed,
                {
                    eventId: uuidv4(),
                    attempt: 1,
                    maxAttempts: 1,
                    occurredAt: new Date().toString(),
                    payload: {
                        mbsData: {
                            subscriptionId
                        },
                    },
                },
            );
            log.error("ProviderStripeCheckoutCompleteUseCase failed : ", error as Error);
            throw error;
        };
    };
};