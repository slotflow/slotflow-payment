import { StripeAccountStatus } from "../enums/payment.enum";

export interface StripeAccountProps {
    _id: string;
    userId: string;
    stripeAccountId: string | null;
    stripeCustomerId?: string | null;
    stripeAccountStatus: StripeAccountStatus;
    createdAt: Date;
    updatedAt: Date;
}