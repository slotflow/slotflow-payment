import { PlanName } from "../../domain/enums/plan.enum";
import { PaymentFor } from "../../domain/enums/payment.enum";
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
  providerId: string;
  planName: PlanName;
  description: string;
  planDuration: number;
  unitAmount: number;
  paymentFor: PaymentFor;
  paymentDate: Date;
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
  appointmentDate: string;
  selectedServiceMode: string;
  bookingId: string;
  userId: string;
  paymentFor: PaymentFor;
  paymentDate: string;
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