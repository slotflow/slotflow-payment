import { kafkaConfig } from "../../../config/env";
import { IdType } from "../../../shared/utils/types";
import { generateId } from "../../../shared/utils/generateId";
import { BadRequestError } from "../../../shared/error/appError";
import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { EventEnvelope, StripeCustomerCreatedEvent } from "../../dtos/kafka.dtos";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { CreateStripeCustomerInput, CreateStripeCustomerOutput } from "../../dtos/stripe.dtos";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class CreateStripeCustomerUseCase {
    constructor(
        private readonly paymentGateway: IPaymentGateway,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { }

    async execute(input: CreateStripeCustomerInput): Promise<CreateStripeCustomerOutput> {
        try {
            const { email, role, userId, username } = input;
            if (!email || !username || !userId || !role) {
                throw new BadRequestError();
            }

            const existingCustomer = await this.paymentGateway.findCustomerByUserId(userId);

            if (existingCustomer) {
                return {
                    stripeCustomerId: existingCustomer.customerId
                };
            }

            const customer = await this.paymentGateway.createStripeCustomer({
                email,
                name: username,
                userId,
                role,
            });

            await this.kafkaProducer.publish<EventEnvelope<StripeCustomerCreatedEvent>>(
                kafkaConfig.topics.pub.stripeCustomerCreated, {
                eventId: generateId(IdType.EVENT),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toString(),
                payload: {
                    mbsData: {
                        stripeCustomerId: customer.customerId,
                        userId,
                    },
                }
            });

            return {
                stripeCustomerId: customer.customerId
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create stripe customer");
        }
    }
}

export const createStripeCustomerUseCase = new CreateStripeCustomerUseCase(paymentGateway, kafkaProducer);