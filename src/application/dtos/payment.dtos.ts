import { PlanName } from "../../domain/enums/plan.enum";
import { PaymentFor } from "../../domain/enums/payment.enum";
import { ServiceMode } from "../../domain/enums/service.enums";
import { BillingCycle, RefundFor, RefundReason } from '../../domain/enums/refund.enum';
import { ApiPaginationRequest, AuthUser, CommonDateInput, PaymentDTO, StatMetric } from "./common.dtos";

//// **** queries dtos ***** ////

// 1. findStatsDataForProviderDashboard method parameter and return
export interface GetProviderRevenueQuery extends CommonDateInput {
  providerId: string;
}
export interface GetProviderRevenueView extends  Record<string, StatMetric | undefined> {
  totalSubscriptionPaidAmount: StatMetric;
  totalEarnings: StatMetric;
  totalPayoutsMade: StatMetric;
  pendingPayout: StatMetric;
}


// 2. findStatsDataForAdminDashboard method parameter and return 
export interface GetAdminRevenueStatsDataQuery extends CommonDateInput {}
export interface GetAdminRevenueStatsDataView extends  Record<string, StatMetric | undefined> {
  totalRevenue: StatMetric;
  totalRevenueViaSubscriptions: StatMetric;
  totalRevenueViaAppointments: StatMetric;
  totalRefundsIssued: StatMetric;
  totalFailedPayments: StatMetric;
  totalPayoutsToProviders: StatMetric;
};


// 3. findAdminRevenueReport method parameter and return
export interface GetAdminRevenueReportQuery extends ApiPaginationRequest {
  startDate: Date;
  endDate: Date;
}
export type AdminFetchRevenueReportRow = Pick<
PaymentDTO,
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


// 4. findAnalyticsForAdminDashboard method parameter and return
export interface GetAdminRevenueAanalyticsQuery extends CommonDateInput {
  startDate: Date;
  endDate: Date;
}
export type GetAdminRevenueAanalyticsView = Array<{
  date: string;
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
}>






//// **** usecase dtos ***** ////

// GetAdminRevenue usecase input output
export type GetAdminRevenueStatsInput = GetAdminRevenueStatsDataQuery;
export type GetAdminRevenueStatsOutput = GetAdminRevenueStatsDataView;


// GetProviderRevenue usecase input output
export type GetProviderRevenueStatsInput = GetProviderRevenueQuery;
export type GetProviderRevenueStatsOutput = GetProviderRevenueView;


// GetAdminReport usecase input output
export type GetAdminRevenueReportInput = GetAdminRevenueReportQuery; 
export type GetAdminRevenueReportOutput = GetAdminRevenueReportView;


// subscription usecase input
export interface SubscriptionCheckoutInput extends Omit<AuthUser, 'id'> {
    subscriptionId: string;
    planName: string;
    billingCycle: BillingCycle;
    unitAmount: number;
    paymentFor: PaymentFor;
    paymentDate: Date;
    priceId: string;
    userId: string;
    trialPeriodDays: number;
    alreadyUsedTrial: boolean;
    isTrial: boolean;
};


// booking checkout usecase input
export interface BookingCheckoutInput {
  serviceName: string;
  description: string;
  unitAmount: number;
  providerId: string;
  slotDuration: number;
  selectedServiceMode: ServiceMode;
  bookingId: string;
  userId: string;
  paymentFor: PaymentFor;
  userEmail: string;
  userName: string;
  pushNotification: boolean;
  stripeCustomerId?: string;
}


// GetPayments usecase input output
export interface userIdAndProviderIdFilterForFetchPayments {
  userId?: string;
  providerId?: string;
}
export interface GetPaymentsInput extends ApiPaginationRequest, userIdAndProviderIdFilterForFetchPayments { };
export type GetPaymentsOutput = Array<Pick<PaymentDTO, "_id" | "createdAt" | "totalAmount" | "paymentFor" | "paymentMethod" | "paymentStatus" | "discountAmount">> | null;


// GetpaymentsDetails usecase input output
export interface GetPaymentDetailsInput {
  paymentId: string;
};
export type GetPaymentDetailsOutput = Omit<PaymentDTO, "_id" | "chargeId" | "receiptEmail" | "receiptNumber" | "updatedAt"> | null;


// refundPayment usecase input
export interface refundPaymentInput {
  bookingId: string;
  paymentId: string;
  refundFor: RefundFor;
  refundReason: RefundReason;
  reasonInDetail: string;
}


// GetAdminRevenueAnalytics usecase
export type GetAdminRevenueAnalyticsInput = GetAdminRevenueAanalyticsQuery;
export type GetAdminRevenueAnalyticsOutput = GetAdminRevenueAanalyticsView;