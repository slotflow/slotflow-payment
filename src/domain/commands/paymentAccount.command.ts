import { PaymentAccountStatus } from "../enums/payment.enum";
import { PaymentAccountProps } from "../contracts/paymentAccount.contract";

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

export type CreatePaymentAccountProps = Pick<PaymentAccountProps, "userId">;