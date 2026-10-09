import { Types } from "mongoose";
import { IPayment } from "../models/payment.model";
import { Payment } from "../../domain/entities/payment.entity";

export class PaymentMapper {
  static toDomain(doc: IPayment): Payment {
    return new Payment({
      _id: doc._id.toString(),
      idempotencyKey: doc.idempotencyKey,
      transactionId: doc.transactionId,
      stripeInvoiceId: doc.stripeInvoiceId,

      paymentStatus: doc.paymentStatus,
      paymentGateway: doc.paymentGateway,
      paymentFor: doc.paymentFor,

      slotflowSubscriptionId: doc.slotflowSubscriptionId ?? undefined,
      slotflowBookingId: doc.slotflowBookingId ?? undefined,

      subtotalAmount: doc.subtotalAmount,
      discountAmount: doc.discountAmount,
      totalAmount: doc.totalAmount,
      currency: doc.currency,
      billingCycle: doc.billingCycle ?? undefined,

      userId: doc.userId ? doc.userId.toString() : undefined,
      providerId: doc.providerId ? doc.providerId.toString() : undefined,

      stripeCustomerId: doc.stripeCustomerId ?? undefined,
      stripeSubscriptionId: doc.stripeSubscriptionId ?? undefined,

      gatewayFee: doc.gatewayFee ?? undefined,
      receiptUrl: doc.receiptUrl,
      receiptPdf: doc.receiptPdf ?? undefined,

      paymentIntent: doc.paymentIntent ?? undefined,
      sessionId: doc.sessionId ?? undefined,

      customerEmail: doc.customerEmail,
      customerName: doc.customerName,
      description: doc.description,
      refundedAmount: doc.refundedAmount ?? undefined,

      paidAt: doc.paidAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: Payment) {
    const props = entity.getProps();

    return {
      idempotencyKey: props.idempotencyKey,
      transactionId: props.transactionId,
      stripeInvoiceId: props.stripeInvoiceId,

      paymentStatus: props.paymentStatus,
      paymentGateway: props.paymentGateway,
      paymentFor: props.paymentFor,

      slotflowSubscriptionId: props.slotflowSubscriptionId,
      slotflowBookingId: props.slotflowBookingId,

      subtotalAmount: props.subtotalAmount,
      discountAmount: props.discountAmount,
      totalAmount: props.totalAmount,
      currency: props.currency,
      billingCycle: props.billingCycle,

      userId: props.userId ? new Types.ObjectId(props.userId) : undefined,
      providerId: props.providerId ? new Types.ObjectId(props.providerId) : undefined,

      stripeCustomerId: props.stripeCustomerId,
      stripeSubscriptionId: props.stripeSubscriptionId ?? null,

      gatewayFee: props.gatewayFee,
      receiptUrl: props.receiptUrl,
      receiptPdf: props.receiptPdf,

      paymentIntent: props.paymentIntent,
      sessionId: props.sessionId,

      customerEmail: props.customerEmail,
      customerName: props.customerName,
      description: props.description,
      refundedAmount: props.refundedAmount,

      paidAt: props.paidAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
