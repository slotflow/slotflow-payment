import { Role } from "../../domain/enums/common.enum";
import { RefundFor, RefundReason, RefundStatus } from "../../domain/enums/refund.enum";
import { PaymentFor, PaymentGateway, PaymentMethod, PaymentStatus } from "../../domain/enums/payment.enum";

// **** Used as the response interface for the all request
export interface CommonResponse {
  success?: boolean;
  message?: string;
};

// **** Used as the response interface for the paginated response
export interface ApiResponse<T = unknown> extends CommonResponse {
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  data?: T;
}

// **** PAYMENT INTERFACE
export interface PaymentDTO {
  _id: string;
  idempotencyKey: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  paymentFor: PaymentFor;
  initialAmount: number;
  discountAmount: number;
  totalAmount: number;
  userId?: string;
  providerId?: string;
  paymentIntentId?: string;
  transactionId: string;
  chargeId?: string;
  gatewayFee: number | null;
  receiptUrl: string | null;
  receiptNumber: string | null;
  receiptEmail: string | null;
  customerEmail: string | null;
  description?: string;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
};

// **** REFUND INTERFACE
export interface RefundDTO {
    _id: string;
    idempotencyKey: string;
    paymentId: string;
    refundId: string;
    amount: number;
    refundStatus: RefundStatus;
    refundGateway: PaymentGateway;
    reason: RefundReason;
    refundFor: RefundFor;
    reasonInDetail: string;
    metadata?: Record<string, string>;
    updatedAt: Date;
    createdAt: Date;
}

// **** Used as the type of table data
export interface TableData<T> {
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  data?: T
};


export interface ApiPaginationRequest {
  page: number;
  limit: number;
}

export interface DecodedUser {
  userOrProviderId: string;
  role: Role;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleId?: string;
  email?: string;
  name?: string;
  image: string | null;
  connectOnly?: boolean;
  exp?: number;
  iat?: number;
  userId?: string;
};


// new 
// used as the return type of the admin fetch dashboard revenue stats data
export interface FetchRevenueDataResponse {
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