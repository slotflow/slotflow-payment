import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentRepository } from "../../../infrastructure/repositoryImpls";
import { BookingCheckoutCompleteUseCase } from "../../../application/useCases/payment/bookingCheckoutComplete.useCase";
import { SubscriptionCheckoutCompleteUseCase } from "../../../application/useCases/payment/subscriptionCheckoutCompleted.useCase";

export const subscriptionCheckoutCompleteUseCase = new SubscriptionCheckoutCompleteUseCase(paymentRepository, kafkaProducer, paymentGateway);

export const bookingCheckoutCompleteUseCase = new BookingCheckoutCompleteUseCase(paymentRepository, kafkaProducer, paymentGateway);