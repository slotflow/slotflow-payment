import { kafkaConfig } from "../../../config/env";
import { AppError } from "../../../shared/error/appError";
import { generateId } from "../../../shared/utils/generateId";
import { ERROR_CODES, IdType } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { UpdateStripeAccountStatusInput } from "../../dtos/stripe.dtos";
import { StripeAccountStatus } from "../../../domain/enums/payment.enum";
import { EventEnvelope, StripeAccountStatusUpdatedEvent } from "../../dtos/kafka.dtos";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IStripeAccountRepository } from "../../../domain/interfaces/repositories/IStripeAccount.repository";

export class UpdateStripeAccountStatusUseCase {
    constructor(
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly stripeAccountRepository: IStripeAccountRepository
    ) { }

    async execute(input: UpdateStripeAccountStatusInput): Promise<void> {
        try {
            const { account } = input;

            const stripeAccount = await this.stripeAccountRepository.findByStripeAccountId({stripeAccountId: account.id});
            if (!stripeAccount) {
                throw new AppError(
                    "Stripe account not found",
                    404,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            let accountStatus: StripeAccountStatus = StripeAccountStatus.PENDING;

            if (!account.details_submitted) {
                accountStatus = StripeAccountStatus.PENDING;
            } else if (!account.charges_enabled) {
                accountStatus = StripeAccountStatus.RESTRICTED;
            } else if (account.charges_enabled && account.payouts_enabled) {
                accountStatus = StripeAccountStatus.ACTIVE;
            }

            await this.kafkaProducer.publish<EventEnvelope<StripeAccountStatusUpdatedEvent>>(
                kafkaConfig.topics.pub.stripeAccountUpdateStatus, {
                eventId: generateId(IdType.EVENT),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toString(),
                payload: {
                    mbsData: {
                        userId: stripeAccount.userId,
                        accountStatus,
                    }
                }
            });

        } catch (error: unknown) {
            throw toAppError(error, "Failed to update stripe account status");
        }
    };
}