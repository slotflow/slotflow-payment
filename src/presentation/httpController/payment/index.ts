import { paymentGateway } from "../../../infrastructure/payment";
import { paymentRepository } from "../../../infrastructure/repositoryImpls";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscriptionCheckout.usecase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/bookingCheckout.useCase";

export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(paymentGateway);

export const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepository);

export const getPaymentDetailsUseCase = new GetPaymentDetailsUseCase(paymentRepository);

export const bookingCheckoutUseCase = new BookingCheckoutUseCase(paymentGateway);
