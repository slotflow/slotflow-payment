import { PaypalDetails, RazorpayDetails, StripeDetails } from "../commands/paymentAccount.command";

export interface PaymentAccountProps {
    _id: string;
    userId: string;
    stripeData?: StripeDetails | null;
    paypalData?: PaypalDetails | null;
    razorpayData?: RazorpayDetails | null;
    createdAt: Date;
    updatedAt: Date;
}