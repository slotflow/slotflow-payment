import { PaymentGateway } from "../enums/payment.enum";
import { RefundStatus, RefundFor, RefundReason } from "../enums/refund.enum";

export interface RefundProps {
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