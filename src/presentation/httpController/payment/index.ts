import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentQueries } from "../../../infrastructure/queriesImpls";
import { paymentRepository } from "../../../infrastructure/repositoryImpls";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/bookingCheckout.useCase";
import { GetAdminRevenueUseCase } from "../../../application/useCases/payment/getAdminRevenue.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { StripeAccountLinkUseCase } from "../../../application/useCases/payment/stripeAccountLink.useCase";
import { GetAdminRevenueReportUseCase } from "../../../application/useCases/payment/getRevenueReport.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscriptionCheckout.usecase";
import { GetProviderRevenueUseCase } from "../../../application/useCases/payment/getProviderRevenue.useCase";

export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(paymentGateway, kafkaProducer);

export const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepository);

export const getPaymentDetailsUseCase = new GetPaymentDetailsUseCase(paymentRepository);

export const bookingCheckoutUseCase = new BookingCheckoutUseCase(paymentGateway, kafkaProducer);

export const getAdminRevenueReportUseCase = new GetAdminRevenueReportUseCase(paymentQueries);

export const stripeAccountLinkUseCase = new StripeAccountLinkUseCase(kafkaProducer);

export const getAdminRevenueUseCase = new GetAdminRevenueUseCase(paymentQueries);

export const getProviderRevenueUseCase = new GetProviderRevenueUseCase(paymentQueries);