import { PlanName } from "../../domain/enums/plan.enum";
import { PaymentFor } from "../../domain/enums/payment.enum";
import { ServiceMode } from "../../domain/enums/service.enums";
import { ApiPaginationRequest, PaymentDTO } from "./common.dtos";
import Stripe from "stripe";


export type FindSubscriptionsByProviderIdResponse = Array<Partial<Pick<PaymentDTO, "totalAmount">>>;

type PaymentsProps = Pick<PaymentDTO, "transactionId" | "discountAmount" | "initialAmount" | "paymentFor" | "paymentGateway" | "paymentMethod" | "paymentStatus" | "totalAmount">;
export interface findSubscriptionFullDetailsResProps {
  paymentId: PaymentsProps | null,
}


export interface ProviderFetchDashboardPaymentStatsDataResponse {
  totalSubscriptionPaidAmount: number;
  totalEarnings: number;
  todaysEarnings: number;
  totalPayoutsMade: number;
  pendingPayout: number;
};


export interface GetAdminRevenueReportRequest extends ApiPaginationRequest {
  startDate?: Date;
  endDate: Date;
};

export interface ProviderFetchDashboardPaymentStatsDataResponse {
  totalSubscriptionPaidAmount: number;
  totalEarnings: number;
  todaysEarnings: number;
  totalPayoutsMade: number;
  pendingPayout: number;
};

// used as the return type of the admin fetch dashboard revenue stats data
export interface AdminFetchDashboardRevenueStatsDataResponse {
  totalRevenue: number;
  totalRevenueViaSubscriptions: number;
  revenueByStripe: number;
  revenueByRazorpay: number;
  revenueByPaypal: number;
  totalRevenueViaAppointments: number;
  totalRefundsIssued: number;
  totalFailedPayments: number;
  totalPayoutsToProviders: number;
};

export interface AdminFetchDashboardTodayStatsDataResponse {
  newUsers: number;
  newProviders: number;

  todaysTotalRevenue: number;
  todaysTotalPayouts: number;

  todaysAppointments: number;
  todaysCancelledAppointments: number;
  todaysCompletedAppointments: number;
};

export type AdminFetchDashboardTodayPaymentStatsDataResponse = Pick<AdminFetchDashboardTodayStatsDataResponse, "todaysTotalPayouts" | "todaysTotalRevenue">;

// Admin fetch revenue report response
export type AdminFetchRevenueReportRow = Pick<
  PaymentDTO,
  | "createdAt"
  | "discountAmount"
  | "initialAmount"
  | "totalAmount"
  | "paymentGateway"
  | "paymentFor"
>;
export interface GetAdminRevenueReportResponse {
  rows: AdminFetchRevenueReportRow[];
  grandTotal: number;
  grandDiscount: number;
  grandInitalAmount: number;
};

export interface SubscriptionCheckoutRequest {
  subscriptionId: string;
  providerId: string;
  planName: PlanName;
  description: string;
  planDuration: number;
  unitAmount: number;
  paymentFor: PaymentFor;
  name: string;
  email: string;
  initialAmount: number;
};

export interface BookingCheckoutRequest {
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
  initialAmount: number;
  pushNotification: boolean;
}


// Used as the payments fetching request and response dto
export interface userIdAndProviderIdFilterForFetchPayments {
  userId?: string;
  providerId?: string;
}
export interface GetPaymentsRequest extends ApiPaginationRequest, userIdAndProviderIdFilterForFetchPayments { };
export type GetPaymentsResponse = Array<Pick<PaymentDTO, "_id" | "createdAt" | "totalAmount" | "paymentFor" | "paymentMethod" | "paymentStatus" | "discountAmount">> | null;


export interface GetPaymentDetailsRequest {
  paymentId: string;
};
export type GetPaymentDetailsResponse = Omit<PaymentDTO, "_id" | "chargeId" | "receiptEmail" | "receiptNumber" | "updatedAt"> | null;


export interface StripeAccountLinkRequest {
  email: string;
};

export type StripeAccountLinkResponse = Stripe.Response<Stripe.AccountLink>;
