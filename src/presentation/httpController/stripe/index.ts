import { ProviderStripeCheckoutCompleteUseCase } from "../../../application/useCases/payment/providerStripeCheckoutCompleted";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentRepository } from "../../../infrastructure/repositoryImpls";

export const providerStripeCheckoutCompleteUseCase = new ProviderStripeCheckoutCompleteUseCase(paymentRepository, kafkaProducer);