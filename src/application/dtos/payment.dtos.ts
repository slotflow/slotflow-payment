import Stripe from "stripe";
import { Role } from "../../domain/enums/common.enum";
import { Payment } from "../../domain/entities/payment.entity";
import { PaymentProps } from "../../domain/contracts/payment.contract";
import { RefundFor, RefundReason } from '../../domain/enums/refund.enum';
import { BillingCycle, PaymentFor } from "../../domain/enums/payment.enum";
import { ApiPaginationRequest, AuthUser, CommonDateInput, StatMetric } from "./common.dtos";

/**
 * Payment queries dtos
 */

// 1. findStatsDataForProviderDashboard
export interface GetProviderRevenueQuery extends CommonDateInput {
    providerId: string;
    timeZone: string;
}
export interface GetProviderRevenueView extends Record<string, StatMetric | undefined> {
    totalSubscriptionPaidAmount: StatMetric;
    totalEarnings: StatMetric;
    totalPayoutsMade: StatMetric;
    pendingPayout: StatMetric;
}


// 2. findStatsDataForAdminDashboard
export interface GetAdminRevenueStatsDataQuery extends CommonDateInput {
    timeZone: string;
}
export interface GetAdminRevenueStatsDataView extends Record<string, StatMetric | undefined> {
    totalRevenue: StatMetric;
    totalRevenueViaSubscriptions: StatMetric;
    totalRevenueViaAppointments: StatMetric;
    totalRefundsIssued: StatMetric;
    totalFailedPayments: StatMetric;
    totalPayoutsToProviders: StatMetric;
};


// 3. findAdminRevenueReport
export interface GetAdminRevenueReportQuery extends ApiPaginationRequest, CommonDateInput {
    timeZone: string;
}
export type AdminFetchRevenueReportRow = Pick<
    PaymentProps,
    | "createdAt"
    | "discountAmount"
    | "totalAmount"
    | "paymentGateway"
    | "paymentFor"
>;
export interface GetAdminRevenueReportView {
    rows: AdminFetchRevenueReportRow[];
    grandTotal: number;
    grandDiscount: number;
    grandInitalAmount: number;
};


// 4. findAnalyticsForAdminDashboard
export interface GetAdminRevenueAanalyticsQuery extends CommonDateInput {
    timeZone: string;
}
export type GetAdminRevenueAanalyticsView = Array<{
    date: string;
    totalRevenue: number;
    totalRefunds: number;
    netRevenue: number;
}>






/**
 * Payment usecases dtos
 */

// GetAdminRevenue
export type GetAdminRevenueStatsInput = GetAdminRevenueStatsDataQuery;
export type GetAdminRevenueStatsOutput = GetAdminRevenueStatsDataView;


// GetProviderRevenue
export type GetProviderRevenueStatsInput = GetProviderRevenueQuery;
export type GetProviderRevenueStatsOutput = GetProviderRevenueView;


// GetAdminReport
export type GetAdminRevenueReportInput = GetAdminRevenueReportQuery;
export type GetAdminRevenueReportOutput = GetAdminRevenueReportView;


// subscription checkout
export interface SubscriptionCheckoutInput extends Omit<AuthUser, 'id'> {
    subscriptionId: string;
    billingCycle: BillingCycle;
    unitAmount: number;
    paymentFor: PaymentFor;
    paymentDate: Date;
    priceId: string;
    trialPeriodDays: number;
    alreadyUsedTrial: boolean;
    isTrial: boolean;
    // subscribing provider details
    userId: string;
};


// booking checkout
export interface BookingCheckoutInput {
    serviceName: string;
    description: string;
    unitAmount: number;
    providerId: string;
    bookingId: string;
    paymentFor: PaymentFor;
    // booking user details
    userId: string;
    email: string;
    name: string;
}


// GetPayments
export interface userIdAndProviderIdFilterForFetchPayments {
    userId?: string;
    providerId?: string;
}
export interface GetPaymentsInput extends ApiPaginationRequest, userIdAndProviderIdFilterForFetchPayments { };
export type GetPaymentsOutput = Array<Pick<PaymentProps, "_id" | "createdAt" | "totalAmount" | "paymentFor" | "paymentStatus" | "discountAmount">> | null;


// GetpaymentsDetails
export interface GetPaymentDetailsInput {
    paymentId: string;
};
export type GetPaymentDetailsOutput = Omit<PaymentProps, "_id" | "chargeId" | "receiptEmail" | "receiptNumber" | "updatedAt"> | null;


// refundPayment
export interface refundPaymentInput {
    bookingId: string;
    paymentId: string;
    refundFor: RefundFor;
    refundReason: RefundReason;
    reasonInDetail: string;
}


// GetAdminRevenueAnalytics
export type GetAdminRevenueAnalyticsInput = GetAdminRevenueAanalyticsQuery;
export type GetAdminRevenueAnalyticsOutput = GetAdminRevenueAanalyticsView;


// BookingPaymentFailed
export interface BookingPaymentFailedInput {
    payment: Payment;
    bookingId: string;
}

// SubscriptionPaymentFailed
export interface SubscriptionPaymentFailedInput {
    payment: Payment;
    subscriptionId: string;
}




/**
 * Stripe payment gateway dtos
 */

export interface CreateSubscriptionCheckoutSessionInput {
    subscriptionId: string;
    userId: string;
    billingCycle: BillingCycle;
    paymentFor: PaymentFor;
    userName: string;
    userEmail: string;
    unitAmount: number;
    successUrl: string;
    cancelUrl: string;
    stripeCustomerId?: string;
    priceId: string;
    trialPeriodDays?: number;
    alreadyUsedTrial: boolean;
    isTrial: boolean;
};

export interface CreateSubscriptionCheckoutSessionOutput {
    sessionId: string;
};

export interface CreateBookingCheckoutSessionInput {
    serviceName: string;
    description: string;
    unitAmount: number;
    providerId: string;
    bookingId: string;
    userId: string;
    paymentFor: PaymentFor;
    userEmail: string;
    userName: string;
    stripeCustomerId?: string;
    successUrl: string;
    cancelUrl: string;
}

export interface CreateBookingCheckoutSessionOutput {
    sessionId: string;
}

export interface CreateStripeCustomerInput {
    email: string;
    name: string;
    userId: string;
    role: Role;
}

export interface CreateStripeCustomerOutput {
    customerId: string;
}

export interface CreateRefundInput {
    paymentIntent: string;
    refundAmount: number;
    stripeAccount?: string;
    reason: RefundReason;
    metadata: {
        bookingId: string;
        paymentId: string;
        reasonInDetail: string;
        refundFor: string;
    }
}

export interface CreateRefundOutput {
    refundId: string;
}

export interface RetrievePaymentIntentInput {
    paymentIntent: string;
}

export interface RetrievePaymentIntentOutput {
    paymentIntent: Stripe.PaymentIntent;
}

export interface RetrieveBalanceInput {
    balanceTransaction: string;
}

export interface RetrieveBalanceOutput {
    balanceTransaction: Stripe.BalanceTransaction;
}

export interface CreateStripeAccountInput {
    email: string;
}

export interface CreateStripeAccountout {
    account: Stripe.Response<Stripe.Account>;
}

export interface CreateStripeAccountLinkInput {
    accountId: string;
}

export interface CreateStripeAccountLinkOutput {
    accountLinkData: Stripe.Response<Stripe.AccountLink>;
}





/**
 * Supporting interfaces
 */

export interface SubscriptionMetaData {
    userId: string;
    userName: string;
    userEmail: string;
    isTrial: string,
    subscriptionId: string;
    billingCycle: BillingCycle;
    paymentFor: PaymentFor;
}

export interface BookingMetaData {
    providerId: string;
    bookingId: string;
    userId: string;
    paymentFor: PaymentFor;
    userEmail: string;
    userName: string;
}