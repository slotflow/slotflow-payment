import { v4 as uuidv4 } from "uuid";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { kafkaConfig, serviceConfig } from "../../../config/env";
import { SubscriptionCheckoutRequest } from "../../dtos/payment.dtos";
import { EventEnvelope, StripeCustomerCreatedEvent } from "../../dtos/kafka.dtos";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { providerPaymentFailedUrl, providerPaymentSuccessUrl } from "../../../shared/utils/constants";

export class SubscriptionCheckoutUseCase {

    constructor(
        private readonly paymentGateway: IPaymentGateway,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: SubscriptionCheckoutRequest): Promise<string> {
        try {

        const {
            subscriptionId,
            providerId,
            planName,
            description,
            planDuration,
            unitAmount,
            paymentFor,
            name,
            email,
            initialAmount,
            stripeCustomerId
        } = payload;


        let newStripeCstomerId: string | undefined = stripeCustomerId ?? undefined;

            if (!stripeCustomerId) {
                const customerId = await this.paymentGateway.createStripeCustomer({
                    email,
                    name,
                    userId: providerId,
                    role: Role.PROVIDER,
                });
                newStripeCstomerId = customerId.customerId;
                await this.kafkaProducer.publish<EventEnvelope<StripeCustomerCreatedEvent>>(
                    kafkaConfig.topics.pub.stripeCustomerCreated, {
                    eventId: uuidv4(),
                    attempt: 1,
                    maxAttempts: 1,
                    occurredAt: new Date().toString(),
                    payload: {
                        mbsData: {
                            stripeCustomerId: customerId.customerId,
                            userId: providerId,
                        },
                    }
                });
            }


            console.log("successUrl : ", serviceConfig.frontendUrl + providerPaymentSuccessUrl);
            console.log("cancelUrl : ", serviceConfig.frontendUrl + providerPaymentFailedUrl);

            const result = await this.paymentGateway.createSubscriptionCheckoutSession({
                subscriptionId,
                providerId,
                planName,
                description,
                planDuration,
                unitAmount,
                paymentFor,
                name,
                email,
                initialAmount,
                stripeCustomerId: newStripeCstomerId,
                successUrl: serviceConfig.frontendUrl + providerPaymentSuccessUrl,
                cancelUrl: serviceConfig.frontendUrl + providerPaymentFailedUrl,
            });

            return result.sessionId;
        } catch (error) {
            log.error("ProviderPaymentCheckoutUseCase failed : ", error as Error);
            throw error;
        };
    };
};