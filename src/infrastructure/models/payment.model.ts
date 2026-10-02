import mongoose, { Document, Schema, Types } from "mongoose";
import { PaymentFor, PaymentGateway, PaymentStatus, BillingCycle } from "../../domain/enums/payment.enum";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  idempotencyKey: string;
  transactionId: string;
  stripeInvoiceId: string;

  paymentStatus: PaymentStatus;
  paymentGateway: PaymentGateway;
  paymentFor: PaymentFor;

  slotflowSubscriptionId?: string;
  slotflowBookingId?: string;

  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  billingCycle?: BillingCycle;

  userId?: Types.ObjectId;
  providerId?: Types.ObjectId;

  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  gatewayFee?: number;
  receiptUrl?: string;
  receiptPdf?: string;

  paymentIntent?: string;
  sessionId?: string;

  customerEmail: string;
  customerName: string;
  description: string;
  refundedAmount?: number;

  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
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
    slotflowSubscriptionId: {
      type: String,
    },
    slotflowBookingId: {
      type: String,
    },
    subtotalAmount: {
      type: Number,
      required: [true, "Subtotal amount is required"],
      min: [0, "Subtotal amount cannot be negative"],
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
    currency: {
      type: String,
      required: [true, "Currency is required"],
      lowercase: true,
      trim: true,
    },
    billingCycle: {
      type: String,
      enum: Object.values(BillingCycle),
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    gatewayFee: {
      type: Number,
    },
    receiptUrl: {
      type: String,
    },
    receiptPdf: {
      type: String,
    },
    stripeInvoiceId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentIntent: {
      type: String,
    },
    sessionId: {
      type: String,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
    },
    customerName: {
      type: String,
    },
    description: {
      type: String,
    },
    refundedAmount: {
      type: Number,
      min: [0, "Refunded amount cannot be negative"],
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index(
  { paymentIntent: 1 },
  {
    unique: true,
    partialFilterExpression: { paymentIntent: { $type: "string" } },
    name: "paymentIntent_unique_string",
  }
);

PaymentSchema.index(
  { sessionId: 1 },
  {
    unique: true,
    partialFilterExpression: { sessionId: { $type: "string" } },
    name: "sessionId_unique_string",
  }
);

PaymentSchema.index(
  { stripeInvoiceId: 1 },
  {
    unique: true,
    partialFilterExpression: { stripeInvoiceId: { $type: "string" } },
    name: "stripeInvoiceId_unique_string",
  }
);

export const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);