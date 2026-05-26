import { kafkaConfig } from "../../../config/env";
import { IdType } from "../../../shared/utils/types";
import { generateId } from "../../../shared/utils/generateId";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { StripeAccountStatus } from "../../../domain/enums/payment.enum";
import { notificationContentMap } from "../../../shared/utils/constants";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { EventEnvelope, StripeAccountStatusUpdatedEvent } from "../../dtos/kafka.dtos";
import { GetStripeAccountStatusInput, GetStripeAccountStatusOutput } from "../../dtos/stripe.dtos";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class GetStripeAccountStatusUseCase {

    constructor(
        private readonly paymentGateway: IPaymentGateway,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { }

    async execute(input: GetStripeAccountStatusInput): Promise<GetStripeAccountStatusOutput> {
        try {
            const { accountId, userId } = input;
            if (!accountId || !userId) {
                throw new BadRequestError();
            }

            const account = await this.paymentGateway.getStripeAccount(accountId);

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
                        userId: userId,
                        accountStatus,
                    },
                    notificationData: {
                        userId,
                        title: notificationContentMap.stripeAccountStatusUpdated.title,
                        body: notificationContentMap.stripeAccountStatusUpdated.body(accountStatus),
                        pushNotification: false,
                    }
                }
            });

            return {
                accountStatus
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get stripe account status")
        }
    }
}