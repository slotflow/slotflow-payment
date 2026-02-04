import { paymentGateway } from "../../infrastructure/payment";
import { kafkaProducer } from "../../infrastructure/messaging";
import { paymentRepository } from "../../infrastructure/repositoryImpls";
import { ProviderPaymentCheckoutUseCase } from "../../application/useCases/providerPayment/providerPaymentCheckout.usecase";
import { ProviderStripeCheckoutCompleteUseCase } from "../../application/useCases/providerPayment/providerStripeCheckoutCompleted";
import { ProviderFetchAllPaymentsUseCase } from "../../application/useCases/providerPayment/providerFetchAllPayments.useCase";

export const providerPaymentCheckoutUseCase = new ProviderPaymentCheckoutUseCase(paymentGateway);

export const providerStripeCheckoutCompleteUseCase = new ProviderStripeCheckoutCompleteUseCase(paymentRepository, kafkaProducer);

export const providerFetchAllPaymentsUseCase = new ProviderFetchAllPaymentsUseCase(paymentRepository);