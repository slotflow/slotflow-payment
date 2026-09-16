import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentRepository, paymentAccountRepository } from "../../../infrastructure/repositoryImpls";
import { StripeAccountRevokedUseCase } from "../../../application/useCases/stripe/stripeAccountRevoked.useCase";
import { BookingCheckoutCompleteUseCase } from "../../../application/useCases/payment/bookingCheckoutComplete.useCase";
import { UpdateStripeAccountStatusUseCase } from "../../../application/useCases/stripe/updateStripeAccountStatus.useCase";
import { SubscriptionCheckoutCompleteUseCase } from "../../../application/useCases/payment/subscriptionCheckoutCompleted.useCase";

export const subscriptionCheckoutCompleteUseCase = new SubscriptionCheckoutCompleteUseCase(paymentRepository, kafkaProducer, paymentGateway);

export const bookingCheckoutCompleteUseCase = new BookingCheckoutCompleteUseCase(paymentRepository, kafkaProducer, paymentGateway);

export const updateStripeAccountStatusUseCase = new UpdateStripeAccountStatusUseCase(paymentAccountRepository);

export const stripeAccountRevokedUseCase = new StripeAccountRevokedUseCase(paymentAccountRepository);