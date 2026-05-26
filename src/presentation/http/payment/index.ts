import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentQueries } from "../../../infrastructure/queriesImpls";
import { paymentRepository, refundRepository } from "../../../infrastructure/repositoryImpls";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { RefundPaymentUseCase } from "../../../application/useCases/payment/refundPayment.useCase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/bookingCheckout.useCase";
import { GetAdminRevenueUseCase } from "../../../application/useCases/payment/getAdminRevenue.useCase";
import { StripeAccountLinkUseCase } from "../../../application/useCases/stripe/stripeAccountLink.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { GetProviderRevenueUseCase } from "../../../application/useCases/payment/getProviderRevenue.useCase";
import { GetAdminRevenueReportUseCase } from "../../../application/useCases/payment/getRevenueReport.useCase";
import { createStripeCustomerUseCase } from "../../../application/useCases/stripe/createStripeCustomer.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscriptionCheckout.useCase";
import { GetStripeAccountStatusUseCase } from "../../../application/useCases/stripe/getStripeAccountStatus.useCase";

export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(paymentGateway, createStripeCustomerUseCase);

export const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepository);

export const getPaymentDetailsUseCase = new GetPaymentDetailsUseCase(paymentRepository);

export const bookingCheckoutUseCase = new BookingCheckoutUseCase(paymentGateway, createStripeCustomerUseCase);

export const getAdminRevenueReportUseCase = new GetAdminRevenueReportUseCase(paymentQueries);

export const stripeAccountLinkUseCase = new StripeAccountLinkUseCase(kafkaProducer, paymentGateway);

export const getAdminRevenueUseCase = new GetAdminRevenueUseCase(paymentQueries);

export const getProviderRevenueUseCase = new GetProviderRevenueUseCase(paymentQueries);

export const refundPaymentUseCase = new RefundPaymentUseCase(paymentRepository, refundRepository, paymentGateway, kafkaProducer);

export const getStripeAccountStatusUseCase = new GetStripeAccountStatusUseCase(paymentGateway, kafkaProducer);