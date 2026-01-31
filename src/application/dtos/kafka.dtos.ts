import { KafkaMessage } from "kafkajs";
import { PaymentDTO } from "./common.dtos";
import { PaymentFor, PaymentStatus } from "../../domain/enums/payment.enum";

// send email common
export interface SendEmailCommon {
    email: string;
    name: string;
}

// send notification common
export interface SendNotificationCommon {
    body: string;
    pushNotification: boolean;
    title: string;
    data?: Record<string, string>;
}

// kafka client adapter props
export interface KafkaClientAdapterProps {
  topic: string;
  partition: number;
  message: KafkaMessage;
}

// kafka client adapter message handler
export type MessageHandler = (payload: KafkaClientAdapterProps) => Promise<void>;

export type ProviderCreatePaymentEvent = Pick<PaymentDTO, "transactionId" | "paymentFor" | "paymentGateway" | "paymentStatus" | "paymentMethod" | "initialAmount" | "discountAmount" | "totalAmount" | "providerId"> & {
    subscriptionId: string;
    planDuration: string;
    email: string;
    name: string;
};

export interface ProviderCreatePaymentFailedEvent {
    subscriptionId: string;
};

export type ProviderCreatePaymentSuccessEvent = Pick<PaymentDTO, "providerId" | "paymentFor" | "paymentStatus" | "totalAmount" | "transactionId"> & SendEmailCommon & SendNotificationCommon & {
    subscriptionId: string;
    paymentId: string;
    planDuration: string;
    paymentDate: string;
};