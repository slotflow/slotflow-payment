import { Types } from "mongoose";
import { IPayment } from "../models/payment.model";
import { Payment } from "../../domain/entities/payment.entity";

export class PaymentMapper {

    static toDomain(doc: IPayment): Payment {
        return new Payment({
            _id: doc._id.toString(),
            idempotencyKey: doc.idempotencyKey,
            transactionId: doc.transactionId,
            paymentStatus: doc.paymentStatus,
            paymentMethod: doc.paymentMethod,
            paymentGateway: doc.paymentGateway,
            paymentFor: doc.paymentFor,
            discountAmount: doc.discountAmount,
            totalAmount: doc.totalAmount,
            userId: doc.userId ? doc.userId.toString() : undefined,
            providerId: doc.providerId ? doc.providerId.toString() : undefined,
            paymentIntentId: doc.paymentIntentId ?? undefined,
            chargeId: doc.chargeId ?? undefined,
            sessionId: doc.sessionId,
            gatewayFee: doc.gatewayFee ?? 0,
            refundedAmount: doc.refundedAmount ?? 0,
            stripeCustomerId: doc.stripeCustomerId,
            stripeSubscriptionId: doc.stripeSubscriptionId,
            stripeInvoiceId: doc.stripeInvoiceId,
            receiptUrl: doc.receiptUrl ?? null,
            receiptNumber: doc.receiptNumber ?? null,
            receiptEmail: doc.receiptEmail ?? null,
            customerEmail: doc.customerEmail ?? null,
            description: doc.description ?? undefined,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: Payment) {
        const props = entity.getProps();

        return {
            idempotencyKey: props.idempotencyKey,
            transactionId: props.transactionId,
            paymentStatus: props.paymentStatus,
            paymentMethod: props.paymentMethod,
            paymentGateway: props.paymentGateway,
            paymentFor: props.paymentFor,
            discountAmount: props.discountAmount,
            totalAmount: props.totalAmount,
            userId: props.userId ? new Types.ObjectId(props.userId) : null,
            providerId: props.providerId ? new Types.ObjectId(props.providerId) : null,
            paymentIntentId: props.paymentIntentId ?? null,
            chargeId: props.chargeId ?? null,
            sessionId: props.sessionId,
            gatewayFee: props.gatewayFee ?? 0,
            refundedAmount: props.refundedAmount ?? 0,
            stripeCustomerId: props.stripeCustomerId,
            stripeSubscriptionId: props.stripeSubscriptionId ?? null,
            stripeInvoiceId: props.stripeInvoiceId,
            receiptUrl: props.receiptUrl ?? null,
            receiptNumber: props.receiptNumber ?? null,
            receiptEmail: props.receiptEmail ?? null,
            customerEmail: props.customerEmail ?? null,
            description: props.description ?? null,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}