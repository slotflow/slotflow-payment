import { v4 as uuidv4 } from "uuid";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { kafkaConfig, serviceConfig } from "../../../config/env";
import { BookingCheckoutRequest } from "../../dtos/payment.dtos";
import { EventEnvelope, StripeCustomerCreatedEvent } from "../../dtos/kafka.dtos";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { bookingPaymentFailedUrl, bookingPaymentSuccessUrl } from "../../../shared/utils/constants";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class BookingCheckoutUseCase {
    constructor(
        private readonly paymentGateway: IPaymentGateway,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { }

    async execute(payload: BookingCheckoutRequest): Promise<string> {
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
            } = payload;

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
                    eventId: uuidv4(),
                    attempt: 1,
                    maxAttempts: 1,
                    occurredAt: new Date().toString(),
                    payload: {
                        mbsData: {
                            stripeCustomerId: customerId.customerId,
                            userId: payload.userId,
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
        } catch (error) {
            log.error("BookingCheckoutUseCase failed : ", error as Error);
            throw error;
        }
    }
}