import { PaymentProps } from "../contracts/payment.contract";

export type CreateForSubscriptionProps = Pick<PaymentProps, "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "initialAmount" | "discountAmount" | "providerId" | "totalAmount" | "chargeId" | "receiptUrl" | "receiptNumber" | "receiptEmail" | "customerEmail" | "description">;

export type CreateForBookingProps = Pick<PaymentProps, "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "initialAmount" | "discountAmount" | "userId" | "totalAmount" | "providerId" | "chargeId" | "receiptUrl" | "receiptNumber" | "receiptEmail" | "customerEmail" | "description">;

export type UpdatePaymentProps = Omit<PaymentProps, "_id" | "userId" | "transactionId" | "providerId" | "createdAt" | "updatedAt">;