import { Role } from "../../domain/enums/common.enum";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../../domain/enums/payment.enum";

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
  _id: string,
  transactionId: string,
  paymentStatus: PaymentStatus,
  paymentMethod: string,
  paymentGateway: PaymentGateway,
  paymentFor: PaymentFor,
  initialAmount: number,
  discountAmount: number,
  totalAmount: number,
  userId?: string | null,
  providerId?: string | null,
  refundId?: string | null,
  refundAmount?: number | null,
  refundStatus?: string | null,
  refundAt?: Date | null,
  refundReason?: string | null,
  chargeId?: string | null,
  createdAt: Date,
  updatedAt: Date,
};

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
  userOrProviderId?: string;
  role?: Role;
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