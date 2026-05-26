import { PaymentProps } from "../contracts/payment.contract";

export type CreateForSubscriptionProps = Pick<PaymentProps, "idempotencyKey" | "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "initialAmount" | "discountAmount" | "providerId" | "totalAmount" | "chargeId" | "sessionId" | "receiptUrl" | "receiptNumber" | "receiptEmail" | "customerEmail" | "description" | "paymentIntentId" | "gatewayFee">;

export type CreateForBookingProps = Pick<PaymentProps, "idempotencyKey" | "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "initialAmount" | "discountAmount" | "userId" | "gatewayFee" | "totalAmount" | "providerId" | "chargeId" | "sessionId" | "receiptUrl" | "receiptNumber" | "receiptEmail" | "customerEmail" | "description" | "paymentIntentId">;

export type PaymentRefundedProps = Pick<PaymentProps, "refundedAmount">;