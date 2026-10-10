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

// payment service subscribing kafka event payload
export interface PSSubKafkaEventPayload<
  T extends PSSubKafkaEventPayloadType = PSSubKafkaEventPayloadType,
> {
  paymentData: T;
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
export interface ProcessEventWrapperInput<
  T extends PSSubKafkaEventPayloadType = PSSubKafkaEventPayloadType,
> {
  topic: string;
  eventData: EventEnvelope<PSSubKafkaEventPayload<T>>;
  businessUseCase: { execute: (data: T) => Promise<void> };
}

// Notification data common event input
interface CommonNotificationEventInput {
  userId: string;
  notificationType: NotificationType;
}

// kafka subscription events union
export type PSSubKafkaEventPayloadType = unknown;

// kafka subscription events mapper
export type PSSubKafkaEventPayloadMap = unknown;

// kafka subscription events handler map type
export type HandlerMap = {
  [K in keyof PSSubKafkaEventPayloadMap]: {
    execute: (input: PSSubKafkaEventPayloadMap[K]) => Promise<void>;
  };
};

/**
 * Kafka events payload
 */

// publishing events

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
}

// provider create payment failed event
export interface ProviderSubscriptionPaymentFailedEvent {
  mbsData: {
    subscriptionId: string;
  };
  notificationData: CommonNotificationEventInput & {};
}

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
  };
}

// Stripe customer create event
export interface StripeCustomerCreatedEvent {
  notificationData: CommonNotificationEventInput & {};
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
  };
  notificationData: CommonNotificationEventInput;
}

// Booking payment event
export interface SubscriptionPaymentFailedEvent {
  mbsData: {
    subscriptionId: string;
  };
  notificationData: CommonNotificationEventInput;
}
