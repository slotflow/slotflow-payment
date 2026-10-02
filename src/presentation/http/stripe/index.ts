import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentRepository, paymentAccountRepository } from "../../../infrastructure/repository";
import { StripeAccountRevokedUseCase } from "../../../application/useCases/stripe/stripeAccountRevoked.useCase";
import { BookingPaymentFailedUseCase } from "../../../application/useCases/payment/booking/bookingPaymentFailed.useCase";
import { UpdateStripeAccountStatusUseCase } from "../../../application/useCases/stripe/updateStripeAccountStatus.useCase";
import { SubscriptionPaymentFailedUseCase } from "../../../application/useCases/payment/subscription/subscriptionPaymentFailed.useCase";
import { BookingInvoicePaymentSucceededUseCase } from "../../../application/useCases/payment/booking/bookingInvoicePaymentSucceeded.useCase";
import { SubscriptionInvoicePaymentSucceededUseCase } from "../../../application/useCases/payment/subscription/subscriptionInvoicePaymentSucceeded.useCase";

export const subscriptionInvoicePaymentSucceededUseCase = new SubscriptionInvoicePaymentSucceededUseCase(paymentRepository, kafkaProducer, paymentGateway);

export const bookingInvoicePaymentSucceededUseCase = new BookingInvoicePaymentSucceededUseCase(paymentRepository, kafkaProducer);

export const updateStripeAccountStatusUseCase = new UpdateStripeAccountStatusUseCase(kafkaProducer, paymentAccountRepository);

export const stripeAccountRevokedUseCase = new StripeAccountRevokedUseCase(paymentAccountRepository);

export const bookingPaymentFailedUseCase = new BookingPaymentFailedUseCase(paymentRepository, kafkaProducer);

export const subscriptionPaymentFailedUseCase = new SubscriptionPaymentFailedUseCase(paymentRepository, kafkaProducer);