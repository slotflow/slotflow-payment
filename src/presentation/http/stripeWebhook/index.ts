import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentRepository } from "../../../infrastructure/repositoryImpls";
import { BookingCheckoutCompleteUseCase } from "../../../application/useCases/payment/bookingCheckoutComplete";
import { SubscriptionCheckoutCompleteUseCase } from "../../../application/useCases/payment/subscriptionCheckoutCompleted";

export const subscriptionCheckoutCompleteUseCase = new SubscriptionCheckoutCompleteUseCase(paymentRepository, kafkaProducer);

export const bookingCheckoutCompleteUseCase = new BookingCheckoutCompleteUseCase(paymentRepository, kafkaProducer, paymentGateway);