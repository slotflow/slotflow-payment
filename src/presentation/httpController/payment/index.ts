import { paymentGateway } from "../../../infrastructure/payment";
import { paymentRepository } from "../../../infrastructure/repositoryImpls";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscriptionCheckout.usecase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/bookingCheckout.useCase";
import { GetAdminRevenueReportUseCase } from "../../../application/useCases/payment/getRevenueReport.useCase";
import { paymentQueries } from "../../../infrastructure/queriesImpls";
import { StripeAccountLinkUseCase } from "../../../application/useCases/payment/stripeAccountLink.useCase";

export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(paymentGateway);

export const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepository);

export const getPaymentDetailsUseCase = new GetPaymentDetailsUseCase(paymentRepository);

export const bookingCheckoutUseCase = new BookingCheckoutUseCase(paymentGateway);

export const getAdminRevenueReportUseCase = new GetAdminRevenueReportUseCase(paymentQueries);

export const stripeAccountLinkUseCase = new StripeAccountLinkUseCase();