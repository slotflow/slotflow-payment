import { KafkaMessage } from "kafkajs";
import { PaymentFor, PaymentStatus, StripeAccountStatus } from "../../domain/enums/payment.enum";
import { RefundStatus } from "../../domain/enums/refund.enum";

// **** COMMON DTOS

// kafka client adapter props
export interface KafkaClientAdapterProps {
    topic: string;
    partition: number;
    message: KafkaMessage;
}

// backend-main service subscribing kafka event payload
export interface PSSubKafkaEventPayload {
    paymentData: any;
}

// dlq metadata
export interface DqMetaData {
    service: string;
    originalTopic: string;
    error: string;
    failedAt: Date;
    retryCount?: number;
}

// event envelope
export interface EventEnvelope<PSSubKafkaEventPayload, M = DqMetaData> {
    eventId: string;
    occurredAt: string;
    attempt: number;
    maxAttempts: number;
    payload: PSSubKafkaEventPayload;
    metadata?: M;
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

// process event wrapper input
export interface ProcessEventWrapperInput {
  topic: string;
  eventData: EventEnvelope<PSSubKafkaEventPayload>;
  businessUseCase: { execute: (data: any) => Promise<void> };
  payloadExtractor: (payload: PSSubKafkaEventPayload) => any;
}


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
        receiptUrl?: string | null;
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
        receiptUrl?: string | null;
    };
    notificationData: SendNotificationCommon;
}


export interface StripeAccountCreatedEvent {
    mbsData: {
        userId: string;
        stripeAccountId: string;
    };
}

export interface StripeAccountStatusUpdatedEvent {
    mbsData: {
        userId: string;
        accountStatus: StripeAccountStatus;
    };
}

export interface StripeCustomerCreatedEvent {
    mbsData: {
        userId: string;
        stripeCustomerId: string;
    };
}

export interface RefundPaymentEvent {
    emailData: {
        email: string;
        name: string;
        refundDate: Date;
        refundAmount: number;
        refundStatus: RefundStatus;
        transactionId: string;
    };
    notificationData: SendNotificationCommon;
}