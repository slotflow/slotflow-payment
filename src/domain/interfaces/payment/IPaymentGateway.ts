import { Role } from "../../enums/common.enum";
import { PaymentFor } from "../../enums/payment.enum";

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

export interface IPaymentGateway {
    createSubscriptionCheckoutSession(payload: CreateSubscriptionCheckoutSessionPayload): Promise<CreateSubscriptionCheckoutSessionResponse>;
    createBookingCheckoutSession(payload: CreateBookingCheckoutSessionPayload): Promise<CreateBookingCheckoutSessionResponse>;
    createStripeCustomer(payload: CreateStripeCustomerPayload): Promise<CreateStripeCustomerResponse>;
};