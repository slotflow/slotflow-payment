import { kafkaProducer } from "../infrastructure/messaging";
import { paymentRepository } from "../infrastructure/repositoryImpls";
import { ProviderCreatePaymentUseCase } from "../application/useCases/kafkaConsumerUsecases/providerCreatePayment.usecase";

export const handlers = {
    providerSubscriptionPaymentRequest: new ProviderCreatePaymentUseCase(paymentRepository, kafkaProducer),

    // userBookingPayment: ,

    // providerPayoutPayment: ,

    // userCancelBooking: ,
}