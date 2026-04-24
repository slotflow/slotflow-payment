import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { ERROR_CODES } from '../../../shared/utils/type';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { AppError, BadRequestError } from '../../../shared/error/appError';
import { EventEnvelope, StripeAccountCreatedEvent } from "../../dtos/kafka.dtos";
import { IPaymentGateway } from '../../../domain/interfaces/payment/IPaymentGateway';
import { StripeAccountLinkRequest, StripeAccountLinkResponse } from "../../dtos/payment.dtos";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class StripeAccountLinkUseCase {
    constructor(
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly paymentGateway: IPaymentGateway
    ) { };

    async execute(payload: StripeAccountLinkRequest): Promise<StripeAccountLinkResponse> {
        try {
            const { email, userId } = payload
            if (!userId || !email) {
                throw new BadRequestError();
            }

            const { account } = await this.paymentGateway.createStripeAccount({ email });

            await this.kafkaProducer.publish<EventEnvelope<StripeAccountCreatedEvent>>(
                kafkaConfig.topics.pub.stripeAccountCreated, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toString(),
                payload: {
                    mbsData: {
                        userId: userId,
                        stripeAccountId: account.id,
                    },
                }
            });

            if (!account.id) {
                throw new AppError(
                    "Failed to get stripe ccountId",
                    500,
                    true,
                    ERROR_CODES.STRIPE_CREATE_ACCOUNT_ERROR
                )
            };

            const { accountLink } = await this.paymentGateway.createStripeAccountLink({
                accountId: account.id
            });

            return accountLink;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create stripe account link");
        };
    };
};