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

export class ProviderStripeCheckoutCompleteUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
    ) { };

    async execute(payload: Stripe.Checkout.Session): Promise<void> {

        log.info(`Payload : ${JSON.stringify(payload)}`);

        const paymentStatus = payload?.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING;
        const paymentIntent = payload?.payment_intent as string;
        const paymentMethod = payload?.payment_method_types[0];
        const providerId = payload?.metadata?.providerId;
        const totalAmount = Number(payload?.metadata?.totalAmount);
        const planDuration = Number(payload?.metadata?.planDuration);
        const paymentFor = payload?.metadata?.paymentFor as PaymentFor;
        const paymentDate = payload?.metadata?.paymentDate;
        const name = payload?.metadata?.name;
        const email = payload?.metadata?.email;
        const initialAmount = Number(payload?.metadata?.initialAmount);
        const discountAmount = Number(payload?.metadata?.discountAmount);
        const subscriptionId = payload?.metadata?.subscriptionId;

        console.log("paymentStatus : ", paymentStatus);
        console.log("paymentIntent : ", paymentIntent);
        console.log("paymentMethod : ", paymentMethod);
        console.log("providerId : ", providerId);
        console.log("totalAmount : ", totalAmount);
        console.log("planDuration : ", planDuration);
        console.log("paymentFor : ", paymentFor);
        console.log("paymentDate : ", paymentDate);
        console.log("name : ", name);
        console.log("email : ", email);
        console.log("initialAmount : ", initialAmount);
        console.log("discountAmount : ", discountAmount);
        console.log("subscriptionId : ", subscriptionId);

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
            })

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