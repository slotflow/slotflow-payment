import { PaymentFor } from "../../domain/enums/payment.enum";
import { PlanName } from "../../domain/enums/plan.enum";
import { SubscriptionValidity } from "../../domain/enums/subscription.enum";
import { ApiPaginationRequest, PaymentDTO } from "./common.dtos";

// **** subscription queries findByProviderId method response payment data fething model

// Used as the response type for fetching subscriptions with planName and plan price of a specific provider for the provider side and admin side
// removing payment dependedcy data from here the data will be requested from payment service from client directly
// removed data

//   Pick<SubscriptionDTO, "_id" | "startDate" | "endDate" | "subscriptionStatus"> &
//   Partial<Pick<PlanDTO, "planName">>>

// needed data 

export type FindSubscriptionsByProviderIdResponse = Array<Partial<Pick<PaymentDTO, "totalAmount">>>;

// Omit<SubscriptionDTO, 'subscriptionPlanId' | "paymentId"> & {
//     subscriptionPlanId: {
//         planName: PlanDTO["planName"];
//     },
// export type PopulatedSubscription = 
//     paymentId: {
//       totalAmount: string;
//     }
// ;


// **** subscription queries findDetails method response payment data fething model

// type SubscriptionProps = Pick<SubscriptionDTO, "startDate" | "endDate" | "subscriptionStatus" | "createdAt">;
type PaymentsProps = Pick<PaymentDTO, "transactionId" | "discountAmount" | "initialAmount" | "paymentFor" | "paymentGateway" | "paymentMethod" | "paymentStatus" | "totalAmount">;
// type PlanProps = Pick<PlanDTO, "planName" | "price" | "adVisibility" | "maxBookingPerMonth">;
export interface findSubscriptionFullDetailsResProps {
  //  SubscriptionProps
  //   subscriptionPlanId: PlanProps,
  paymentId: PaymentsProps | null,
}


export interface ProviderFetchDashboardPaymentStatsDataResponse {
  totalSubscriptionPaidAmount: number;
  totalEarnings: number;
  todaysEarnings: number;
  totalPayoutsMade: number;
  pendingPayout: number;
};


// Admin fetch revenue report request
export interface AdminFetchRevenueReportRequest extends ApiPaginationRequest {
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
export interface AdminFetchRevenueReportResponse {
  rows: AdminFetchRevenueReportRow[];
  grandTotal: number;
  grandDiscount: number;
  grandInitalAmount: number;
};

export interface ProviderPaymentCheckoutRequest {
  subscriptionId: string;
  planName: PlanName;
  description: string;
  planDuration: SubscriptionValidity;
  unitAmount: number;
  providerId: string;
  totalAmount: number;
  paymentFor: PaymentFor;
  paymentDate: Date;
  name: string;
  email: string;
  initialAmount: number;
  discountAmount: number;
};