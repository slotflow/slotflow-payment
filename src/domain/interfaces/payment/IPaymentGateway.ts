import { PaymentFor } from "../../enums/payment.enum";

export interface SubscriptionCreateCheckoutSessionPayload {
    subscriptionId: string;
    providerId: string;
    planDuration: number;
    planName: string;
    description: string;
    unitAmount: number;
    successUrl: string;
    cancelUrl: string;
    totalAmount: number;
    paymentFor: PaymentFor;
    paymentDate: string;
    name: string;
    email: string;
    initialAmount: number;
    discountAmount: number;
};

export interface SubscriptionCreateCheckoutSessionResult {
    sessionId: string;
};

export interface IPaymentGateway {
    subscriptionCreateCheckoutSession(payload: SubscriptionCreateCheckoutSessionPayload): Promise<SubscriptionCreateCheckoutSessionResult>;
};