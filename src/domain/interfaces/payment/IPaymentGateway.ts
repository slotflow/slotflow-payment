import Stripe from "stripe";
import { Role } from "../../enums/common.enum";
import { PaymentFor } from "../../enums/payment.enum";
import { RefundReason } from "../../enums/refund.enum";

export interface CreateSubscriptionCheckoutSessionPayload {
    subscriptionId: string;
    providerId: string;
    planName: string;
    description: string;
    planDuration: number;
    unitAmount: number;
    paymentFor: PaymentFor;
    name: string;
    email: string;
    initialAmount: number;
    successUrl: string;
    cancelUrl: string;
    stripeCustomerId?: string;
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
    initialAmount: number;
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

export interface CreateRefundInput {
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

export interface RetrievePaymentIntentInput {
    paymentIntent: string;
}

export interface RetrievePaymentIntentOutput {
    paymentIntent: Stripe.PaymentIntent;
}

export interface RetrieveBalanceInput {
    balanceTransaction: string;
}

export interface RetrieveBalanceOutput {
    balanceTransaction: Stripe.BalanceTransaction;
}

export interface CreateStripeAccountInput {
    email: string;
}

export interface CreateStripeAccountout {
    account: Stripe.Response<Stripe.Account>;
}

export interface CreateStripeAccountLinkInput {
    accountId: string;
}

export interface CreateStripeAccountLinkOutput {
    accountLinkData: Stripe.Response<Stripe.AccountLink>;
}

export interface IPaymentGateway {
    createSubscriptionCheckoutSession(payload: CreateSubscriptionCheckoutSessionPayload): Promise<CreateSubscriptionCheckoutSessionResponse>;

    createBookingCheckoutSession(payload: CreateBookingCheckoutSessionPayload): Promise<CreateBookingCheckoutSessionResponse>;

    createStripeCustomer(payload: CreateStripeCustomerPayload): Promise<CreateStripeCustomerResponse>;

    createRefund(input: CreateRefundInput): Promise<CreateRefundOutput>;

    retrievePaymentIntent(input: RetrievePaymentIntentInput): Promise<RetrievePaymentIntentOutput>;

    retrieveBalance(input: RetrieveBalanceInput): Promise<RetrieveBalanceOutput>;

    createStripeAccount(input: CreateStripeAccountInput): Promise<CreateStripeAccountout>;

    createStripeAccountLink(input: CreateStripeAccountLinkInput): Promise<CreateStripeAccountLinkOutput>;

    findCustomerByUserId(userId: string): Promise<{ customerId: string } | null>;

    getStripeAccount(accountId: string): Promise<Stripe.Account>;
};