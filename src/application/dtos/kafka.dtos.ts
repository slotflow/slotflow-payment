import { KafkaMessage } from "kafkajs";
import { PaymentAccountStatus } from "../../domain/enums/payment.enum";
import { NotificationType } from "../../domain/enums/common.enum";

/**
 * Kafka common dtos
 */

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

// kafka client adapter message handler
export type MessageHandler = (payload: KafkaClientAdapterProps) => Promise<void>;

// process event wrapper input
export interface ProcessEventWrapperInput {
    topic: string;
    eventData: EventEnvelope<PSSubKafkaEventPayload>;
    businessUseCase: { execute: (data: any) => Promise<void> };
    payloadExtractor: (payload: PSSubKafkaEventPayload) => any;
}

// Notification data common event input
interface CommonNotificationEventInput {
    userId: string;
    notificationType: NotificationType;
}





/**
 * Kafka events payload
 */

// provider create payment success event
export interface ProviderSubscriptionPaymentSuccessEvent {
    mbsData: {
        subscriptionId: string;
        paymentId: string;
        providerId: string;
        isTrial: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
        cancelAt: Date | null;
        lastEventAt: Date;
    };
    emailData: SendEmailCommon & {
        paymentDate: string;
        totalAmount: number;
        transactionId: string;
        receiptUrl?: string | null;
    };
    notificationData: CommonNotificationEventInput & {
        transactionId: string;
    };
};

// provider create payment failed event
export interface ProviderSubscriptionPaymentFailedEvent {
    mbsData: {
        subscriptionId: string;
    },
    notificationData: CommonNotificationEventInput & {
    };
};

// Booking payment success event
export interface CreateBookingPaymentSuccessEvent {
    mbsData: {
        bookingId: string;
        paymentId: string;
    };
    emailData: {
        email: string;
        name: string;
        paymentDate: string;
        totalAmount: number;
        transactionId: string;
        receiptUrl?: string | null;
    };
    notificationData: CommonNotificationEventInput & {
        transactionId: string;
    }
}

// Stripe customer create event
export interface StripeCustomerCreatedEvent {
    notificationData: CommonNotificationEventInput & {
    }
}

// Refund payment success event
export interface RefundPaymentSuccessEvent {
    emailData: {
        email: string;
        name: string;
        refundDate: Date;
        refundAmount: number;
        transactionId: string;
    };
    notificationData: CommonNotificationEventInput & {
        refundAmount: number;
        transactionId: string;
    };
}

// Stripe account status updated event
export interface StripeAccountStatusUpdatedEvent {
    notificationData: CommonNotificationEventInput & {
        accountStatus: PaymentAccountStatus;
    };
}

// Booking payment event
export interface BookingPaymentFailedEvent {
    mbsData: {
        bookingId: string;
    },
    notificationData: CommonNotificationEventInput;
}

// Booking payment event
export interface SubscriptionPaymentFailedEvent {
    mbsData: {
        subscriptionId: string;
    },
    notificationData: CommonNotificationEventInput;
}