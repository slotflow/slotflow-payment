import { paymentGateway } from "../../../infrastructure/payment";
import { kafkaProducer } from "../../../infrastructure/messaging";
import { paymentQueries } from "../../../infrastructure/queries";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { RefundPaymentUseCase } from "../../../application/useCases/payment/refundPayment.useCase";
import { StripeAccountLinkUseCase } from "../../../application/useCases/stripe/stripeAccountLink.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { GetAdminRevenueReportUseCase } from "../../../application/useCases/payment/getRevenueReport.useCase";
import { createStripeCustomerUseCase } from "../../../application/useCases/stripe/createStripeCustomer.useCase";
import {
  paymentRepository,
  refundRepository,
  paymentAccountRepository,
} from "../../../infrastructure/repository";
import { GetStripeAccountStatusUseCase } from "../../../application/useCases/paymentAccount/getStripeAccountStatus.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscription/subscriptionCheckout.useCase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/booking/bookingCheckout.useCase";
import { GetAdminRevenueStatsUseCase } from "../../../application/useCases/payment/revenue/getAdminRevenueStats.useCase";
import { GetProviderRevenueStatsUseCase } from "../../../application/useCases/payment/revenue/getProviderRevenueStats.useCase";
import { GetAdminRevenueAanalyticsUseCase } from "../../../application/useCases/payment/revenue/getAdminRevenueAnalytics.useCase";

export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(
  paymentGateway,
  createStripeCustomerUseCase,
  paymentAccountRepository,
);

export const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepository);

export const getPaymentDetailsUseCase = new GetPaymentDetailsUseCase(paymentRepository);

export const bookingCheckoutUseCase = new BookingCheckoutUseCase(
  paymentGateway,
  createStripeCustomerUseCase,
  paymentAccountRepository,
);

export const getAdminRevenueReportUseCase = new GetAdminRevenueReportUseCase(paymentQueries);

export const getAdminRevenueStatsUseCase = new GetAdminRevenueStatsUseCase(paymentQueries);

export const getProviderRevenueStatsUseCase = new GetProviderRevenueStatsUseCase(paymentQueries);

export const refundPaymentUseCase = new RefundPaymentUseCase(
  paymentRepository,
  refundRepository,
  paymentGateway,
  kafkaProducer,
);

export const stripeAccountLinkUseCase = new StripeAccountLinkUseCase(
  paymentGateway,
  paymentAccountRepository,
);

export const getStripeAccountStatusUseCase = new GetStripeAccountStatusUseCase(
  paymentGateway,
  paymentAccountRepository,
);

export const getAdminRevenueAanalyticsUseCase = new GetAdminRevenueAanalyticsUseCase(
  paymentQueries,
);
