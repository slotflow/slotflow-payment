import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { stripe } from "../../../infrastructure/lib/stripe";
import { EventEnvelope, StripeAccountCreatedEvent } from "../../dtos/kafka.dtos";
import { StripeAccountLinkRequest, StripeAccountLinkResponse } from "../../dtos/payment.dtos";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class StripeAccountLinkUseCase {
    constructor(
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: StripeAccountLinkRequest): Promise<StripeAccountLinkResponse> {
        try {

            const { email, role, userId } = payload

            const account = await stripe.accounts.create({
                type: "express",
                email: email,
            });

            if (!account) throw new Error("Stripe connecting failed");

            await this.kafkaProducer.publish<EventEnvelope<StripeAccountCreatedEvent>>(
                kafkaConfig.topics.pub.stripeAccountCreated, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toString(),
                payload: {
                    mbsData: {
                        role: role,
                        userId: userId,
                        stripeAccountId: account.id,
                    },
                }
            })

            const accountLink = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${process.env.FRONTEND_URL}/provider/stripe/refresh`,
                return_url: `${process.env.FRONTEND_URL}/provider/stripe/success`,
                type: "account_onboarding",
            });

            console.log("accountLink : ", accountLink);

            return accountLink;
        } catch (error) {
            log.error("StripeAccountLinkUseCase failed", error as Error);
            throw error;
        };
    };
};