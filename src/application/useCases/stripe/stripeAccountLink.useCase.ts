import { kafkaConfig } from "../../../config/env";
import { generateId } from '../../../shared/utils/generateId';
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { StripeAccountStatus } from "../../../domain/enums/payment.enum";
import { AppError, BadRequestError } from '../../../shared/error/appError';
import { StripeAccount } from "../../../domain/entities/stripeAccount.entity";
import { EventEnvelope, StripeAccountCreatedEvent } from "../../dtos/kafka.dtos";
import { IPaymentGateway } from '../../../domain/interfaces/payment/IPaymentGateway';
import { StripeAccountLinkInput, StripeAccountLinkOutput } from "../../dtos/stripe.dtos";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IStripeAccountRepository } from "../../../domain/interfaces/repositories/IStripeAccount.repository";

export class StripeAccountLinkUseCase {
    constructor(
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly paymentGateway: IPaymentGateway,
        private readonly stripeAccountRepository: IStripeAccountRepository
    ) { };

    async execute(input: StripeAccountLinkInput): Promise<StripeAccountLinkOutput> {
        try {
            console.log("StripeAccountLinkUseCase start")
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

            const existingByUser = await this.stripeAccountRepository.findByUserId({userId});
            let stripeAccountEntity: StripeAccount | null = null;
            if (existingByUser) {
                stripeAccountEntity = existingByUser;
                console.log("Existing StripeAccount found for user", userId);
            } else {
                const existingStripeAccount = await this.stripeAccountRepository.findByStripeAccountId({stripeAccountId: account.id});
                if (!existingStripeAccount) {
                    const created = await this.stripeAccountRepository.create(StripeAccount.create({
                        userId: userId,
                        stripeAccountId: account.id,
                        stripeAccountStatus: StripeAccountStatus.PENDING,
                    }));
                    if (!created) {
                        throw new AppError(
                            "Failed to create stripe account in database",
                            500,
                            false,
                            ERROR_CODES.INTERNAL_ERROR
                        );
                    }
                    stripeAccountEntity = created;
                }
            }
            console.log("account created : ", account);

            const { accountLinkData } = await this.paymentGateway.createStripeAccountLink({
                accountId: account.id
            });
            console.log("account onboarding link created : ", accountLinkData);

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
                    }
                }
            });

            return {
                accountLink: accountLinkData.url,
                accountId: account.id
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create stripe account link");
        };
    };
};