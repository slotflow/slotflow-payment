import { PaymentProps } from "../contracts/payment.contract";
import { BillingCycle, PaymentFor, PaymentGateway, PaymentStatus } from "../enums/payment.enum";
import {
  CreateForBookingProps,
  CreateForPaymentFailedProps,
  CreateForSubscriptionProps,
  PaymentRefundedProps,
} from "../commands/payment.command";

export class Payment {
  private props: PaymentProps;

  constructor(props: PaymentProps) {
    this.props = props;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static createForSubscription(props: CreateForSubscriptionProps) {
    const now = new Date();
    return new Payment({
      _id: "",
      idempotencyKey: props.idempotencyKey,
      transactionId: props.transactionId,
      stripeInvoiceId: props.stripeInvoiceId,

      paymentStatus: props.paymentStatus,
      paymentGateway: props.paymentGateway,
      paymentFor: props.paymentFor,

      slotflowSubscriptionId: props.slotflowSubscriptionId,

      subtotalAmount: props.subtotalAmount,
      discountAmount: props.discountAmount,
      totalAmount: props.totalAmount,
      currency: props.currency,
      billingCycle: props.billingCycle,

      userId: props.userId,

      stripeCustomerId: props.stripeCustomerId,
      stripeSubscriptionId: props.stripeSubscriptionId,

      gatewayFee: props.gatewayFee,
      receiptUrl: props.receiptUrl,
      receiptPdf: props.receiptPdf,

      customerEmail: props.customerEmail,
      customerName: props.customerName,
      description: props.description,

      paidAt: props.paidAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createForBooking(props: CreateForBookingProps) {
    const now = new Date();
    return new Payment({
      _id: "",
      idempotencyKey: props.idempotencyKey,
      transactionId: props.transactionId,
      stripeInvoiceId: props.stripeInvoiceId,

      paymentStatus: props.paymentStatus,
      paymentGateway: props.paymentGateway,
      paymentFor: props.paymentFor,

      slotflowBookingId: props.slotflowBookingId,

      subtotalAmount: props.subtotalAmount,
      discountAmount: props.discountAmount,
      totalAmount: props.totalAmount,
      currency: props.currency,

      userId: props.userId,
      providerId: props.providerId,

      stripeCustomerId: props.stripeCustomerId,

      gatewayFee: props.gatewayFee,
      receiptUrl: props.receiptUrl,
      receiptPdf: props.receiptPdf,

      customerEmail: props.customerEmail,
      customerName: props.customerName,
      description: props.description,

      paidAt: props.paidAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createForPaymentFailed(props: CreateForPaymentFailedProps) {
    const now = new Date();
    return new Payment({
      _id: "",
      idempotencyKey: props.idempotencyKey,
      transactionId: props.transactionId,

      paymentStatus: props.paymentStatus,
      paymentGateway: props.paymentGateway,
      paymentFor: props.paymentFor,

      subtotalAmount: props.subtotalAmount,
      discountAmount: props.discountAmount,
      totalAmount: props.totalAmount,
      currency: props.currency,

      userId: props.userId,

      stripeCustomerId: props.stripeCustomerId,

      gatewayFee: props.gatewayFee,

      stripeInvoiceId: props.stripeInvoiceId,
      paymentIntent: props.paymentIntent,
      sessionId: props.sessionId,

      customerEmail: props.customerEmail,
      customerName: props.customerName,
      description: props.description,

      createdAt: now,
      updatedAt: now,
    });
  }

  // Getters

  get _id(): string {
    return this.props._id;
  }

  get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }

  get transactionId(): string {
    return this.props.transactionId;
  }

  get stripeInvoiceId(): string | undefined {
    return this.props.stripeInvoiceId;
  }

  get paymentStatus(): PaymentStatus {
    return this.props.paymentStatus;
  }

  get paymentGateway(): PaymentGateway {
    return this.props.paymentGateway;
  }

  get paymentFor(): PaymentFor {
    return this.props.paymentFor;
  }

  get slotflowSubscriptionId(): string | undefined {
    return this.props.slotflowSubscriptionId;
  }

  get slotflowBookingId(): string | undefined {
    return this.props.slotflowBookingId;
  }

  get subtotalAmount(): number {
    return this.props.subtotalAmount;
  }

  get discountAmount(): number {
    return this.props.discountAmount;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get billingCycle(): BillingCycle | undefined {
    return this.props.billingCycle;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get providerId(): string | undefined {
    return this.props.providerId;
  }

  get stripeCustomerId(): string | undefined {
    return this.props.stripeCustomerId;
  }

  get stripeSubscriptionId(): string | undefined {
    return this.props.stripeSubscriptionId;
  }

  get gatewayFee(): number | undefined {
    return this.props.gatewayFee;
  }

  get receiptUrl(): string | undefined {
    return this.props.receiptUrl;
  }

  get receiptPdf(): string | undefined {
    return this.props.receiptPdf;
  }

  get paymentIntent(): string | undefined {
    return this.props.paymentIntent;
  }

  get sessionId(): string | undefined {
    return this.props.sessionId;
  }

  get customerEmail(): string {
    return this.props.customerEmail;
  }

  get customerName(): string {
    return this.props.customerName;
  }

  get description(): string {
    return this.props.description;
  }

  get refundedAmount(): number | undefined {
    return this.props.refundedAmount;
  }

  get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Methods

  getProps(): Readonly<PaymentProps> {
    return { ...this.props };
  }

  updateGatewayFee(gatewayFee: number) {
    if (gatewayFee === null || gatewayFee === undefined || gatewayFee < 0) return;
    this.props.gatewayFee = gatewayFee;
    this.touch();
  }

  paymentRefunded(props: PaymentRefundedProps) {
    this.props.refundedAmount = props.refundedAmount;
    this.props.paymentStatus = PaymentStatus.REFUNDED;
    this.touch();
  }
}
