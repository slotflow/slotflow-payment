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
    appointmentDate: string;
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
}

export interface CreateBookingCheckoutSessionResponse {
    sessionId: string;
}

export interface IPaymentGateway {
    createSubscriptionCheckoutSession(payload: CreateSubscriptionCheckoutSessionPayload): Promise<CreateSubscriptionCheckoutSessionResponse>;
    createBookingCheckoutSession(payload: CreateBookingCheckoutSessionPayload): Promise<CreateBookingCheckoutSessionResponse>;
};