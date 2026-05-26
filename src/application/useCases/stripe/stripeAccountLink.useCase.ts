import { kafkaConfig } from "../../../config/env";
import { generateId } from '../../../shared/utils/generateId';
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { notificationContentMap } from "../../../shared/utils/constants";
import { AppError, BadRequestError } from '../../../shared/error/appError';
import { EventEnvelope, StripeAccountCreatedEvent } from "../../dtos/kafka.dtos";
import { IPaymentGateway } from '../../../domain/interfaces/payment/IPaymentGateway';
import { StripeAccountLinkInput, StripeAccountLinkOutput } from "../../dtos/stripe.dtos";
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
            if (!account.id) {
                throw new AppError(
                    "Failed to get stripe ccountId",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                )
            };

            const { accountLink } = await this.paymentGateway.createStripeAccountLink({
                accountId: account.id
            });

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
                    notificationData: {
                        userId,
                        title: notificationContentMap.stripeAccountCreated.title,
                        body: notificationContentMap.stripeAccountCreated.body(),
                        pushNotification: false,
                    }
                }
            });

            return {
                accountLink,
                accountId: account.id
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create stripe account link");
        };
    };
};