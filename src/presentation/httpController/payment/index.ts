import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentRepository } from "../../../infrastructure/repositoryImpls";
import { ProviderPaymentCheckoutUseCase } from "../../../application/useCases/payment/providerPaymentCheckout.usecase";
import { ProviderStripeCheckoutCompleteUseCase } from "../../../application/useCases/payment/providerStripeCheckoutCompleted";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";

export const providerPaymentCheckoutUseCase = new ProviderPaymentCheckoutUseCase(paymentGateway);

export const providerStripeCheckoutCompleteUseCase = new ProviderStripeCheckoutCompleteUseCase(paymentRepository, kafkaProducer);

export const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepository);

export const getPaymentDetailsUseCase = new GetPaymentDetailsUseCase(paymentRepository);
