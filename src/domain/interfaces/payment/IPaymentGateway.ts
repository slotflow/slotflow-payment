import Stripe from "stripe";
import { Role } from "../../enums/common.enum";
import { PaymentFor } from "../../enums/payment.enum";
import { BillingCycle, RefundReason } from "../../enums/refund.enum";

export interface CreateSubscriptionCheckoutSessionPayload {
    subscriptionId: string;
    userId: string;
    planName: string;
    billingCycle: BillingCycle;
    paymentFor: PaymentFor;
    userName: string;
    userEmail: string;
    unitAmount: number;
    successUrl: string;
    cancelUrl: string;
    stripeCustomerId?: string;
    priceId: string;
    trialPeriodDays?: number;
    alreadyUsedTrial: boolean;
    isTrial: boolean;
};

export interface CreateSubscriptionCheckoutSessionResponse {
    sessionId: string;
};

export interface CreateBookingCheckoutSessionPayload {
    serviceName: string;
    description: string;
    unitAmount: number;
    providerId: string;
    slotDuration: number;
    selectedServiceMode: string;
    bookingId: string;
    userId: string;
    paymentFor: PaymentFor;
    userEmail: string;
    userName: string;
    successUrl: string;
    cancelUrl: string;
    pushNotification: string;
    stripeCustomerId?: string;
}

export interface CreateBookingCheckoutSessionResponse {
    sessionId: string;
}

export interface CreateStripeCustomerPayload {
    email: string;
    name: string;
    userId: string;
    role: Role;
}

export interface CreateStripeCustomerResponse {
    customerId: string;
}

export interface CreateRefundPayload {
    paymentIntent: string;
    refundAmount: number;
    stripeAccount?: string;
    reason: RefundReason;
    metadata: {
        bookingId: string;
        paymentId: string;
        reasonInDetail: string;
        refundFor: string;
    }
}

export interface CreateRefundOutput {
    refundId: string;
}

export interface RetrievePaymentIntentPayload {
    paymentIntent: string;
}

export interface RetrievePaymentIntentOutput {
    paymentIntent: Stripe.PaymentIntent;
}

export interface RetrieveBalancePayload {
    balanceTransaction: string;
}

export interface RetrieveBalanceOutput {
    balanceTransaction: Stripe.BalanceTransaction;
}

export interface CreateStripeAccountPayload {
    email: string;
}

export interface CreateStripeAccountout {
    account: Stripe.Response<Stripe.Account>;
}

export interface CreateStripeAccountLinkPayload {
    accountId: string;
}

export interface CreateStripeAccountLinkOutput {
    accountLinkData: Stripe.Response<Stripe.AccountLink>;
}

export interface IPaymentGateway {
    createSubscriptionCheckoutSession(payload: CreateSubscriptionCheckoutSessionPayload): Promise<CreateSubscriptionCheckoutSessionResponse>;

    createBookingCheckoutSession(payload: CreateBookingCheckoutSessionPayload): Promise<CreateBookingCheckoutSessionResponse>;

    createStripeCustomer(payload: CreateStripeCustomerPayload): Promise<CreateStripeCustomerResponse>;

    createRefund(payload: CreateRefundPayload): Promise<CreateRefundOutput>;

    retrievePaymentIntent(payload: RetrievePaymentIntentPayload): Promise<RetrievePaymentIntentOutput>;

    retrieveBalance(payload: RetrieveBalancePayload): Promise<RetrieveBalanceOutput>;

    createStripeAccount(payload: CreateStripeAccountPayload): Promise<CreateStripeAccountout>;

    createStripeAccountLink(input: CreateStripeAccountLinkPayload): Promise<CreateStripeAccountLinkOutput>;

    findCustomerByUserId(userId: string): Promise<{ customerId: string } | null>;

    getStripeAccount(accountId: string): Promise<Stripe.Account>;

    getSubscription(subscriptionId: string): Promise<Stripe.Subscription>;

    getInvoice(invoiceId: string): Promise<Stripe.Invoice>;
};