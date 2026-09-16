import { PaymentAccount } from "../../entities/paymentAccount.entity";

export interface IPaymentAccountRepository {
    create(paymentAccount: PaymentAccount): Promise<PaymentAccount>;

    findByUserId({ userId }: { userId: string }): Promise<PaymentAccount | null>;

    update(paymentAccount: PaymentAccount): Promise<PaymentAccount>;

    findByStripeAccountId({ stripeAccountId }: { stripeAccountId: string }): Promise<PaymentAccount | null>;

    findByStripeCustomerId({ stripeCustomerId }: { stripeCustomerId: string }): Promise<PaymentAccount | null>;

    findByPaypalMerchantId({ paypalMerchantId }: { paypalMerchantId: string }): Promise<PaymentAccount | null>;

    findByPaypalPayerId({ paypalPayerId }: { paypalPayerId: string }): Promise<PaymentAccount | null>;

    findByRazorpayAccountId({ razorpayAccountId }: { razorpayAccountId: string }): Promise<PaymentAccount | null>;

    findByRazorpayCustomerId({ razorpayCustomerId }: { razorpayCustomerId: string }): Promise<PaymentAccount | null>;
}