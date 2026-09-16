import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentQueries } from "../../../infrastructure/queriesImpls";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { RefundPaymentUseCase } from "../../../application/useCases/payment/refundPayment.useCase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/bookingCheckout.useCase";
import { StripeAccountLinkUseCase } from "../../../application/useCases/stripe/stripeAccountLink.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { GetAdminRevenueReportUseCase } from "../../../application/useCases/payment/getRevenueReport.useCase";
import { createStripeCustomerUseCase } from "../../../application/useCases/stripe/createStripeCustomer.useCase";
import { GetAdminRevenueStatsUseCase } from "../../../application/useCases/payment/getAdminRevenueStats.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscriptionCheckout.useCase";
import { GetStripeAccountStatusUseCase } from "../../../application/useCases/stripe/getStripeAccountStatus.useCase";
import { GetProviderRevenueStatsUseCase } from "../../../application/useCases/payment/getProviderRevenueStats.useCase";
import { paymentRepository, refundRepository, paymentAccountRepository } from "../../../infrastructure/repositoryImpls";
import { GetAdminRevenueAanalyticsUseCase } from "../../../application/useCases/payment/getAdminRevenueAnalytics.useCase";

export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(paymentGateway, createStripeCustomerUseCase, paymentAccountRepository);

export const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepository);

export const getPaymentDetailsUseCase = new GetPaymentDetailsUseCase(paymentRepository);

export const bookingCheckoutUseCase = new BookingCheckoutUseCase(paymentGateway, createStripeCustomerUseCase);

export const getAdminRevenueReportUseCase = new GetAdminRevenueReportUseCase(paymentQueries);

export const getAdminRevenueStatsUseCase = new GetAdminRevenueStatsUseCase(paymentQueries);

export const getProviderRevenueStatsUseCase = new GetProviderRevenueStatsUseCase(paymentQueries);

export const refundPaymentUseCase = new RefundPaymentUseCase(paymentRepository, refundRepository, paymentGateway, kafkaProducer);

export const stripeAccountLinkUseCase = new StripeAccountLinkUseCase(kafkaProducer, paymentGateway, paymentAccountRepository);

export const getStripeAccountStatusUseCase = new GetStripeAccountStatusUseCase(paymentGateway, paymentAccountRepository);

export const getAdminRevenueAanalyticsUseCase = new GetAdminRevenueAanalyticsUseCase(paymentQueries);