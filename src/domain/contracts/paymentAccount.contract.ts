import { PaymentAccountStatus } from "../enums/payment.enum";

export interface StripeDetails {
    customerId?: string | null;
    accountId?: string | null;
    accountStatus: PaymentAccountStatus;
}

export interface PaypalDetails {
    payerId?: string | null;
    merchantId?: string | null;
    accountStatus: PaymentAccountStatus;
}

export interface RazorpayDetails {
    customerId?: string | null;
    accountId?: string | null;
    accountStatus: PaymentAccountStatus;
}

export interface PaymentAccountProps {
    _id: string;
    userId: string;
    stripeData?: StripeDetails | null;
    paypalData?: PaypalDetails | null;
    razorpayData?: RazorpayDetails | null;
    createdAt: Date;
    updatedAt: Date;
}