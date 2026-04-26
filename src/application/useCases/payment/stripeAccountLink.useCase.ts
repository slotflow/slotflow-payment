import { kafkaConfig } from "../../../config/env";
import { generateId } from '../../../shared/utils/generateId';
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { AppError, BadRequestError } from '../../../shared/error/appError';
import { EventEnvelope, StripeAccountCreatedEvent } from "../../dtos/kafka.dtos";
import { IPaymentGateway } from '../../../domain/interfaces/payment/IPaymentGateway';
import { StripeAccountLinkInput, StripeAccountLinkOutput } from "../../dtos/payment.dtos";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class StripeAccountLinkUseCase {
    constructor(
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly paymentGateway: IPaymentGateway
    ) { };

    async execute(input: StripeAccountLinkInput): Promise<StripeAccountLinkOutput> {
        try {
            const { email, userId } = input
            if (!userId || !email) {
                throw new BadRequestError();
            }

            const { account } = await this.paymentGateway.createStripeAccount({ email });

            await this.kafkaProducer.publish<EventEnvelope<StripeAccountCreatedEvent>>(
                kafkaConfig.topics.pub.stripeAccountCreated, {
                eventId: generateId(IdType.EVENT),
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