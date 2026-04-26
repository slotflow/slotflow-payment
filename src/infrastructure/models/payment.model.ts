import mongoose, { Document, Schema, Types } from "mongoose";
import { PaymentFor, PaymentGateway, PaymentMethod, PaymentStatus } from "../../domain/enums/payment.enum";

export interface IPayment extends Document {
    _id: Types.ObjectId;
    idempotencyKey: string;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentGateway: PaymentGateway;
    paymentFor: PaymentFor;
    initialAmount: number;
    discountAmount: number;
    totalAmount: number;

    userId?: Types.ObjectId;
    providerId?: Types.ObjectId;

    paymentIntentId?: string;
    transactionId: string;
    chargeId?: string;
    gatewayFee?: number;
    receiptUrl?: string;
    receiptNumber?: string;
    receiptEmail?: string;
    customerEmail?: string;
    description?: string;
    refundedAmount?: number;
    createdAt: Date;
    updatedAt: Date;
};

const PaymentSchema = new Schema<IPayment>({
    idempotencyKey: {
        type: String,
        required: [true, "idempotencyKey is required"],
        unique: true,
    },
    transactionId: {
        type: String,
        required: [true, "Transaction ID is required"],
        unique: true,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
        required: [true, "Payment status is required"],
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
        required: [true, "Payment method is required"],
    },
    paymentGateway: {
        type: String,
        enum: Object.values(PaymentGateway),
        required: [true, "Payment gateway is required"],
    },
    paymentFor: {
        type: String,
        enum: Object.values(PaymentFor),
        required: [true, "Payment purpose is required"],
    },
    initialAmount: {
        type: Number,
        required: [true, "Initial amount is required"],
        min: [0, "Initial amount cannot be negative"],
    },
    discountAmount: {
        type: Number,
        required: [true, "Discount amount is required"],
        min: [0, "Discount amount cannot be negative"],
    },
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"],
        min: [0, "Total amount cannot be negative"],
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: false,
    },
    providerId: {
        type: Schema.Types.ObjectId,
        required: false,
    },
    paymentIntentId: {
        type: String,
    },
    chargeId: {
        type: String,
    },
    gatewayFee: {
        type: Number,
        default: 0,
    },
    receiptUrl: {
        type: String,
    },
    receiptNumber: {
        type: String,
    },
    receiptEmail: {
        type: String,
    },
    customerEmail: {
        type: String,
    },
    description: {
        type: String,
    },
    refundedAmount: {
        type: Number,
        default: 0,
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

export const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);