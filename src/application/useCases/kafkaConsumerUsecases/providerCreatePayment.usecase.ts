import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { Payment } from "../../../domain/entities/payment.entity";
import { notificationContentMap } from "../../../shared/utils/constants";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { ProviderCreatePaymentFailedEvent, ProviderCreatePaymentEvent, ProviderCreatePaymentSuccessEvent } from "../../dtos/kafka.dtos";

export class ProviderCreatePaymentUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
    ) { };

    async execute(payload: ProviderCreatePaymentEvent): Promise<void> {

        const { discountAmount,
            initialAmount,
            paymentFor,
            paymentGateway,
            paymentMethod,
            paymentStatus,
            totalAmount,
            transactionId,
            providerId,
            subscriptionId,
            planDuration,
            email,
            name,
        } = payload;
        
        try {

            if (!providerId ||
                !providerId ||
                !transactionId ||
                !paymentFor ||
                !paymentGateway ||
                !paymentMethod ||
                !paymentStatus ||
                initialAmount == null ||
                discountAmount == null ||
                totalAmount == null ||
                !planDuration) {
                log.error("Invalid request")
                return;
            };

            const paymentData = Payment.createForSubscription({
                transactionId,
                paymentStatus,
                paymentMethod,
                paymentGateway,
                paymentFor,
                initialAmount,
                discountAmount,
                totalAmount,
                providerId,
            });

            const payment = await this.paymentRepository.create(paymentData);
            await this.kafkaProducer.publish<ProviderCreatePaymentSuccessEvent>(
                kafkaConfig.topics.pub.providerSubscriptionPaymentSuccess,
                {
                    subscriptionId,
                    paymentId: payment._id.toString(),
                    planDuration,
                    providerId,
                    email,
                    name,
                    totalAmount,
                    transactionId,
                    paymentDate: payment.createdAt.toISOString(),
                    paymentStatus,
                    paymentFor,
                    pushNotification: true,
                    title: notificationContentMap.providerSubscriptionPayment.title,
                    body: notificationContentMap.providerSubscriptionPayment.body(planDuration),
                }
            );

        } catch (error) {
            await this.kafkaProducer.publish<ProviderCreatePaymentFailedEvent>(
                kafkaConfig.topics.pub.providerSubscriptionPaymentFailed,
                {
                    subscriptionId
                }
            );
            log.error("ProviderCreatePaymentUseCase error : ", error as Error);
            throw error;
        }
    }
}