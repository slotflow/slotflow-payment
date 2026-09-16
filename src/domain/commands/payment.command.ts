import { PaymentProps } from "../contracts/payment.contract";

export type CreateForSubscriptionProps = Pick<PaymentProps, "idempotencyKey" | "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "discountAmount" | "providerId" | "totalAmount" | "chargeId" | "sessionId" | "receiptUrl" | "receiptNumber" | "receiptEmail" | "customerEmail" | "description" | "paymentIntentId" | "gatewayFee" | 'stripeCustomerId' | 'stripeInvoiceId' | 'stripeSubscriptionId'>;

export type CreateForBookingProps = Pick<PaymentProps, "idempotencyKey" | "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "discountAmount" | "userId" | "gatewayFee" | "totalAmount" | "providerId" | "chargeId" | "sessionId" | "receiptUrl" | "receiptNumber" | "receiptEmail" | "customerEmail" | "description" | "paymentIntentId" | 'stripeCustomerId' | 'stripeInvoiceId'>;

export type PaymentRefundedProps = Pick<PaymentProps, "refundedAmount">;