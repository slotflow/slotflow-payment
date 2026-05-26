import mongoose, { Schema, Types, Document } from "mongoose";
import { PaymentGateway } from "../../domain/enums/payment.enum";
import { RefundFor, RefundReason, RefundStatus } from "../../domain/enums/refund.enum";

export interface IRefund extends Document {
    _id: string;
    idempotencyKey: string;
    paymentId: Types.ObjectId;
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

const refundSchema = new Schema<IRefund>({
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required"],
        unique: true,
    },
    paymentId: {
        type: Schema.Types.ObjectId,
        ref: 'payments',
        required: [true, "Payment ID is required"],
    },
    refundId: {
        type: String,
        required: [true, "Refund ID is required"],
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount cannot be negative"],
    },
    refundStatus: {
        type: String,
        enum: Object.values(RefundStatus),
        required: [true, "Refund status is required"],
    },
    refundGateway: {
        type: String,
        enum: Object.values(PaymentGateway)
    },
    reason: {
        type: String,
        enum: Object.values(RefundReason),
        required: [true, "Reason is required"],
    },
    refundFor: {
        type: String,
        enum: Object.values(RefundFor),
        required: [true, "Refund for is required"],
    },
    reasonInDetail: {
        type: String,
        required: [true, "Reason in detail is required"],
    },
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: true,
    }
});

export const RefundModel = mongoose.model<IRefund>("Refund", refundSchema);