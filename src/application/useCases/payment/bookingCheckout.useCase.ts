import { IdType } from "../../../shared/utils/types";
import { Role } from "../../../domain/enums/common.enum";
import { generateId } from "../../../shared/utils/generateId";
import { BadRequestError } from "../../../shared/error/appError";
import { BookingCheckoutInput } from "../../dtos/payment.dtos";
import { kafkaConfig, serviceConfig } from "../../../config/env";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { EventEnvelope, StripeCustomerCreatedEvent } from "../../dtos/kafka.dtos";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { bookingPaymentFailedUrl, bookingPaymentSuccessUrl } from "../../../shared/utils/constants";

export class BookingCheckoutUseCase {
    constructor(
        private readonly paymentGateway: IPaymentGateway,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { }

    async execute(input: BookingCheckoutInput): Promise<string> {
        try {
            const {
                serviceName,
                description,
                unitAmount,
                providerId,
                slotDuration,
                selectedServiceMode,
                bookingId,
                userId,
                paymentFor,
                userEmail,
                userName,
                initialAmount,
                pushNotification,
                stripeCustomerId
            } = input;

            if (!serviceName ||
                !description ||
                !unitAmount ||
                !providerId ||
                !slotDuration ||
                !selectedServiceMode ||
                !bookingId ||
                !userId ||
                !paymentFor ||
                !userEmail ||
                !userName ||
                !initialAmount ||
                !pushNotification
            ) {
                throw new BadRequestError();
            }

            let newStripeCstomerId: string | undefined = stripeCustomerId ?? undefined;

            if (!stripeCustomerId) {
                const customerId = await this.paymentGateway.createStripeCustomer({
                    email: userEmail,
                    name: userName,
                    userId: userId,
                    role: Role.USER,
                });
                newStripeCstomerId = customerId.customerId;
                await this.kafkaProducer.publish<EventEnvelope<StripeCustomerCreatedEvent>>(
                    kafkaConfig.topics.pub.stripeCustomerCreated, {
                    eventId: generateId(IdType.EVENT),
                    attempt: 1,
                    maxAttempts: 1,
                    occurredAt: new Date().toString(),
                    payload: {
                        mbsData: {
                            stripeCustomerId: customerId.customerId,
                            userId: input.userId,
                        },
                    }
                });
            }

            const result = await this.paymentGateway.createBookingCheckoutSession({
                serviceName,
                description,
                unitAmount,
                providerId,
                slotDuration,
                selectedServiceMode,
                bookingId,
                userId,
                paymentFor,
                userEmail,
                userName,
                initialAmount,
                stripeCustomerId: newStripeCstomerId,
                successUrl: serviceConfig.frontendUrl + bookingPaymentSuccessUrl,
                cancelUrl: serviceConfig.frontendUrl + bookingPaymentFailedUrl,
                pushNotification: pushNotification.toString()
            });

            return result.sessionId;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to booking checkout");
        }
    }
}