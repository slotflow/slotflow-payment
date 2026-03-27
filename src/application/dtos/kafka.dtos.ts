import { KafkaMessage } from "kafkajs";
import { PaymentFor, PaymentStatus } from "../../domain/enums/payment.enum";
import { Role } from "../../domain/enums/common.enum";

// **** COMMON DTOS

// kafka client adapter props
export interface KafkaClientAdapterProps {
    topic: string;
    partition: number;
    message: KafkaMessage;
}

// event envelope
export interface EventEnvelope<T> {
    eventId: string;
    occurredAt: string;
    attempt: number;
    maxAttempts: number;
    payload: T;
}

// send email common
export interface SendEmailCommon {
    email: string;
    name: string;
}

// send notification common
export interface SendNotificationCommon {
    userId: string;
    body: string;
    pushNotification: boolean;
    title: string;
    data?: Record<string, string>;
}

// kafka client adapter message handler
export type MessageHandler = (payload: KafkaClientAdapterProps) => Promise<void>;




// **** KAFKA EVENTS PAYLOAD

// provider create payment success event
export interface ProviderCreatePaymentSuccessEvent {
    mbsData: {
        subscriptionId: string;
        paymentId: string;
        planDuration: number;
        providerId: string;
    };
    emailData: SendEmailCommon & {
        paymentDate: Date;
        paymentFor: PaymentFor;
        paymentStatus: PaymentStatus;
        totalAmount: number;
        transactionId: string;
        recieptUrl?: string | null;
    };
    notificationData: SendNotificationCommon;
};

// provider create payment failed event
export interface ProviderCreatePaymentFailedEvent {
    mbsData: {
        subscriptionId: string;
    }
};


export interface CreateBookingPaymentSuccessEvent {
    mbsData: {
        bookingId: string;
        paymentId: string;
    };
    emailData: {
        email: string;
        name: string;
        paymentDate: Date;
        paymentFor: PaymentFor;
        paymentStatus: PaymentStatus;
        totalAmount: number;
        transactionId: string;
        recieptUrl?: string | null;
    };
    notificationData: SendNotificationCommon;
}

export interface CreateBookingPaymentFailedEvent {
    mbsData: {
        bookingId: string;
    }
}


export interface StripeAccountCreatedEvent {
    mbsData: {
        role: Role;
        userId: string;
        stripeAccountId: string;
    };
}

export interface StripeCustomerCreatedEvent {
    mbsData: {
        role: Role;
        userId: string;
        stripeCustomerId: string;
    };
}