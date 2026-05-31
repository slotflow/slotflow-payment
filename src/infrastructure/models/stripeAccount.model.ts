import { Schema, model, Document } from "mongoose";
import { StripeAccountStatus } from "../../domain/enums/payment.enum";

export interface IStripeAccount extends Document {
    _id: string;
    userId: string;
    stripeAccountId: string | null;
    stripeCustomerId: string | null;
    stripeAccountStatus: StripeAccountStatus;
    createdAt: Date;
    updatedAt: Date;
}

const stripeAccountSchema = new Schema<IStripeAccount>(
    {
        userId: {
            type: String,
            required: true,
            unique: true
        },
        stripeAccountId: {
            type: String,
            required: true,
            unique: true
        },
        stripeCustomerId: {
            type: String
        },
        stripeAccountStatus: {
            type: String,
            enum: Object.values(StripeAccountStatus),
            required: true,
        },
        createdAt: {
            type: Date,
            required: true
        },
        updatedAt: {
            type: Date,
            required: true
        }
    }
);

export const StripeAccountModel = model<IStripeAccount>("StripeAccount",stripeAccountSchema);