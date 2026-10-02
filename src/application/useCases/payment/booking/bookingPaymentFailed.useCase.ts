import { kafkaConfig } from "../../../../config/env";
import { IdType } from "../../../../shared/utils/types/enums";
import { BookingPaymentFailedInput } from "../../../dtos/payment.dtos";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { generateId } from "../../../../shared/utils/helpers/generateId";
import { notificationType } from "../../../../shared/utils/constants/constants";
import { BookingPaymentFailedEvent, EventEnvelope } from "../../../dtos/kafka.dtos";
import { IKafkaProducerAdapter } from "../../../interfaces/messaging/IKafkaProducer.adapter";
import { IPaymentRepository } from "../../../../domain/interfaces/repositories/IPayment.repository";

export class BookingPaymentFailedUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
    ) { }

    async execute(input: BookingPaymentFailedInput): Promise<void> {
        try {
            const {
                bookingId,
                payment
            } = input;

            if(payment) {
                const newPayment = await this.paymentRepository.create(payment);
                if (!newPayment || !newPayment.userId || !bookingId) return;
                
                await this.kafkaProducer.publish<EventEnvelope<BookingPaymentFailedEvent>>(
                    kafkaConfig.topics.pub.userBookingPaymentFailed,
                    {
                        eventId: generateId(IdType.EVENT),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toString(),
                        payload: {
                            mbsData: {
                                bookingId,
                            },
                            notificationData: {
                                userId: newPayment.userId,
                                notificationType: notificationType.ACCOUNT_ACTIVITY
                            },
                        },
                    }
                );
            }
        } catch (error) {
            throw toAppError(error, "Failed to handle booking payment failure.");
        }
    }
}