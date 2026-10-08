import { kafkaConfig } from "../../../../config/env";
import { IdType } from "../../../../shared/utils/types/enums";
import { generateId } from "../../../../shared/utils/helpers/generateId";
import { SubscriptionPaymentFailedInput } from "../../../dtos/payment.dtos";
import { EventEnvelope, SubscriptionPaymentFailedEvent } from "../../../dtos/kafka.dtos";
import { IKafkaProducerAdapter } from "../../../interfaces/messaging/IKafkaProducer.adapter";
import { IPaymentRepository } from "../../../../domain/interfaces/repositories/IPayment.repository";
import { NotificationType } from "../../../../domain/enums/common.enum";

export class SubscriptionPaymentFailedUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { }

    async execute(input: SubscriptionPaymentFailedInput): Promise<void> {
        try {
            
            const {
                payment,
                subscriptionId
            } = input;

            if (payment) {
                const newPayment = await this.paymentRepository.create(payment);
                if (!newPayment || !newPayment.userId || !subscriptionId) return;

                await this.kafkaProducer.publish<EventEnvelope<SubscriptionPaymentFailedEvent>>(
                    kafkaConfig.topics.pub.providerSubscriptionPaymentFailed,
                    {
                        eventId: generateId(IdType.EVENT),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toString(),
                        payload: {
                            mbsData: {
                                subscriptionId: subscriptionId,
                            },
                            notificationData: {
                                userId: newPayment.userId,
                                notificationType: NotificationType.ACCOUNT_ACTIVITY
                            },
                        },
                    },
                )
            }
        } catch (error) {

        }
    }
}