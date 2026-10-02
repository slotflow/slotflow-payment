import mongoose, { Schema } from "mongoose";
import { PaymentAccountStatus } from "../../domain/enums/payment.enum";
import { PaypalDetails, RazorpayDetails, StripeDetails } from "../../domain/commands/paymentAccount.command";

export interface IPaymentAccount extends Document {
    _id: mongoose.Types.ObjectId;
    userId: string;
    stripeData?: StripeDetails | null;
    paypalData?: PaypalDetails | null;
    razorpayData?: RazorpayDetails | null;
    createdAt: Date;
    updatedAt: Date;
}

const StripeDetailsSchema = new Schema<StripeDetails>(
    {
        customerId: { type: String, default: null },
        accountId: { type: String, default: null },
        accountStatus: {
            type: String,
            enum: Object.values(PaymentAccountStatus),
            default: PaymentAccountStatus.NOT_CONNECTED,
            required: true,
        },
    },
    { _id: false }
);

const PaypalDetailsSchema = new Schema<PaypalDetails>(
    {
        payerId: { type: String, default: null },
        merchantId: { type: String, default: null },
        accountStatus: {
            type: String,
            enum: Object.values(PaymentAccountStatus),
            default: PaymentAccountStatus.NOT_CONNECTED,
            required: true,
        },
    },
    { _id: false }
);

const RazorpayDetailsSchema = new Schema<RazorpayDetails>(
    {
        customerId: { type: String, default: null },
        accountId: { type: String, default: null },
        accountStatus: {
            type: String,
            enum: Object.values(PaymentAccountStatus),
            default: PaymentAccountStatus.NOT_CONNECTED,
            required: true,
        },
    },
    { _id: false }
);

const PaymentAccountSchema = new Schema<IPaymentAccount>(
    {
        userId: {
            type: String,
            required: [true, "userId is required"],
            unique: true,
            index: true,
        },
        stripeData: {
            type: StripeDetailsSchema,
            default: null,
        },
        paypalData: {
            type: PaypalDetailsSchema,
            default: null,
        },
        razorpayData: {
            type: RazorpayDetailsSchema,
            default: null,
        }
    },
    {
        timestamps: true,
    }
);

export const PaymentAccountModel = mongoose.model<IPaymentAccount>(
    "PaymentAccount",
    PaymentAccountSchema
);