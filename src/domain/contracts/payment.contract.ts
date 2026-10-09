import { PaymentFor, PaymentGateway, PaymentStatus, BillingCycle } from "../enums/payment.enum";

export interface PaymentProps {
  _id: string;
  idempotencyKey: string;
  transactionId: string;
  stripeInvoiceId?: string; // invoice.id

  paymentStatus: PaymentStatus;
  paymentGateway: PaymentGateway;
  paymentFor: PaymentFor; // parent.subscription_details.metadata.paymentFor

  slotflowSubscriptionId?: string; // parent.subscription_details.metadata.subscriptionId
  slotflowBookingId?: string; // metadata.slotflowBookingId

  subtotalAmount: number; // invoice.subtotal
  discountAmount: number; // invoice.discount || 0
  totalAmount: number; // invoice.total
  currency: string; // invoice.currency
  billingCycle?: BillingCycle; // parent.subscription_details.metadata.billingCycle

  userId?: string;
  providerId?: string;

  stripeCustomerId?: string; // invoice.customer
  stripeSubscriptionId?: string; // parent.subscription_details.subscription

  sessionId?: string;
  paymentIntent?: string;

  gatewayFee?: number;
  receiptUrl?: string; // invoice.hosted_invoice_url
  receiptPdf?: string; // invoice.invoice_pdf

  customerEmail: string; // invoice.customer_email
  customerName: string; // customer.customer_name
  description: string; // billing_reason
  refundedAmount?: number;

  paidAt?: Date; // invoice.created
  createdAt: Date;
  updatedAt: Date;
}
