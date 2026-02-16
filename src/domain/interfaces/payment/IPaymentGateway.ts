import { PaymentFor } from "../../enums/payment.enum";

export interface SubscriptionCreateCheckoutSessionPayload {
    subscriptionId: string;
    providerId: string;
    planName: string;
    description: string;
    planDuration: number;
    unitAmount: number;
    paymentFor: PaymentFor;
    paymentDate: string;
    name: string;
    email: string;
    initialAmount: number;
    successUrl: string;
    cancelUrl: string;
};

export interface SubscriptionCreateCheckoutSessionResult {
    sessionId: string;
};

export interface IPaymentGateway {
    subscriptionCreateCheckoutSession(payload: SubscriptionCreateCheckoutSessionPayload): Promise<SubscriptionCreateCheckoutSessionResult>;
};