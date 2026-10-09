import Stripe from "stripe";
import { IdType } from "../../shared/utils/types/enums";
import { Payment } from "../../domain/entities/payment.entity";
import { generateId } from "../../shared/utils/helpers/generateId";
import { CreateForPaymentFailedProps } from "../../domain/commands/payment.command";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../../domain/enums/payment.enum";
import { IPaymentFailedMapper } from "../../application/interfaces/helper/IPaymentMapper.helper";

export class PaymentFailedMapper implements IPaymentFailedMapper {
  constructor() {}

  fromPaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Payment {
    const props: CreateForPaymentFailedProps = {
      idempotencyKey: generateId(IdType.IDEMPOTENCY),
      transactionId: generateId(IdType.TRANSACTION),

      paymentStatus: PaymentStatus.FAILED,
      paymentGateway: PaymentGateway.STRIPE,
      paymentFor: paymentIntent.metadata.paymentFor as PaymentFor,

      subtotalAmount: paymentIntent.amount / 100,
      discountAmount: 0,
      totalAmount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,

      userId: paymentIntent.metadata?.userId,
      stripeCustomerId: paymentIntent.customer as string,

      paymentIntent: paymentIntent.id as string,

      slotflowSubscriptionId: paymentIntent.metadata?.subscriptionId,
      slotflowBookingId: paymentIntent.metadata?.bookingId,

      customerEmail: paymentIntent.metadata.userEmail,
      customerName: paymentIntent.metadata?.userName,
      description: paymentIntent.last_payment_error?.message || "Payment attempt failed",
    };
    return Payment.createForPaymentFailed(props);
  }

  fromInvoicePaymentFailed(invoice: Stripe.Invoice): Payment {
    const props: CreateForPaymentFailedProps = {
      idempotencyKey: generateId(IdType.IDEMPOTENCY),
      transactionId: generateId(IdType.TRANSACTION),

      paymentStatus: PaymentStatus.FAILED,
      paymentGateway: PaymentGateway.STRIPE,
      paymentFor: invoice.metadata?.paymentFor as PaymentFor,

      subtotalAmount: invoice.subtotal,
      discountAmount: (invoice.subtotal || 0) - (invoice.total || 0),
      totalAmount: invoice.total,
      currency: invoice.currency,

      userId: invoice.metadata?.userId,
      stripeCustomerId: invoice.customer as string,

      stripeInvoiceId: invoice.id,

      slotflowSubscriptionId: invoice.metadata?.subscriptionId,
      slotflowBookingId: invoice.metadata?.bookingId,

      customerEmail: invoice.metadata?.userEmail as string,
      customerName: invoice.metadata?.userName as string,
      description: "Invoice payment failed",
    };

    return Payment.createForPaymentFailed(props);
  }

  fromCheckoutSessionExpired(session: Stripe.Checkout.Session): Payment {
    const props: CreateForPaymentFailedProps = {
      idempotencyKey: generateId(IdType.IDEMPOTENCY),
      transactionId: generateId(IdType.TRANSACTION),

      paymentStatus: PaymentStatus.FAILED,
      paymentGateway: PaymentGateway.STRIPE,
      paymentFor: session.metadata?.paymentFor as PaymentFor,

      subtotalAmount: (session.amount_subtotal || 0) / 100,
      discountAmount: ((session.amount_subtotal || 0) - (session.amount_total || 0)) / 100,
      totalAmount: (session.amount_total || 0) / 100,
      currency: session.currency as string,

      userId: session.metadata?.userId,
      stripeCustomerId: session.customer as string,
      paymentIntent: session.payment_intent as string,
      sessionId: session.id,

      slotflowSubscriptionId: session.metadata?.subscriptionId,
      slotflowBookingId: session.metadata?.bookingId,

      customerEmail: session.customer_details?.email || session.metadata?.userEmail || "",
      customerName: session.customer_details?.name || session.metadata?.userName || "",
      description: "Checkout session expired without payment",
    };

    return Payment.createForPaymentFailed(props);
  }
}
