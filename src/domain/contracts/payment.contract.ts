import { PaymentFor, PaymentGateway, PaymentMethod, PaymentStatus } from "../enums/payment.enum";

export interface PaymentProps {
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
}