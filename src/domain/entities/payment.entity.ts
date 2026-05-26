import { PaymentProps } from "../contracts/payment.contract";
import { PaymentFor, PaymentGateway, PaymentMethod, PaymentStatus } from "../enums/payment.enum";
import { CreateForBookingProps, CreateForSubscriptionProps, PaymentRefundedProps } from "../commands/payment.command";

export class Payment {

    private props: PaymentProps;

    constructor(props: PaymentProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static createForSubscription(props: CreateForSubscriptionProps) {
        return new Payment({
            _id: "",
            idempotencyKey: props.idempotencyKey,
            paymentStatus: props.paymentStatus,
            paymentMethod: props.paymentMethod,
            paymentGateway: props.paymentGateway,
            paymentFor: props.paymentFor,
            
            initialAmount: props.initialAmount,
            discountAmount: props.discountAmount,
            totalAmount: props.totalAmount,
            providerId: props.providerId,

            paymentIntentId: props.paymentIntentId,
            transactionId: props.transactionId,
            chargeId: props.chargeId,
            sessionId: props.sessionId,
            gatewayFee: props.gatewayFee,

            receiptUrl: props.receiptUrl,
            receiptNumber: props.receiptNumber,
            receiptEmail: props.receiptEmail,
            customerEmail: props.customerEmail,
            description: props.description,

            createdAt: new Date(),
            updatedAt: new Date(),
        })
    };

    static createForBooking(props: CreateForBookingProps) {
        return new Payment({
            _id: "",
            idempotencyKey: props.idempotencyKey,
            paymentStatus: props.paymentStatus,
            paymentMethod: props.paymentMethod,
            paymentGateway: props.paymentGateway,
            paymentFor: props.paymentFor,
            
            initialAmount: props.initialAmount,
            discountAmount: props.discountAmount,
            totalAmount: props.totalAmount,
            userId: props.userId,
            
            paymentIntentId: props.paymentIntentId,
            transactionId: props.transactionId,
            chargeId: props.chargeId,
            sessionId: props.sessionId,
            gatewayFee: props.gatewayFee,

            receiptUrl: props.receiptUrl,
            receiptNumber: props.receiptNumber,
            receiptEmail: props.receiptEmail,
            customerEmail: props.customerEmail,
            description: props.description,

            createdAt: new Date(),
            updatedAt: new Date(),
        })
    };

    // Getters

    get _id(): string {
        return this.props._id
    };

    get idempotencyKey(): string {
        return this.props.idempotencyKey;
    };

    get refundedAmount(): number | undefined {
        return this.props.refundedAmount;
    };

    get gatewayFee(): number | null {
        return this.props.gatewayFee;
    };

    get paymentIntentId(): string | null | undefined {
        return this.props.paymentIntentId;
    };

    get createdAt(): Date {
        return this.props.createdAt;
    };

    get discountAmount(): number {
        return this.props.discountAmount;
    };

    get paymentFor(): PaymentFor {
        return this.props.paymentFor;
    };

    get paymentGateway(): PaymentGateway {
        return this.props.paymentGateway;
    };

    get paymentMethod(): PaymentMethod {
        return this.props.paymentMethod;
    };

    get paymentStatus(): PaymentStatus {
        return this.props.paymentStatus;
    };

    get totalAmount(): number {
        return this.props.totalAmount;
    };

    get transactionId(): string {
        return this.props.transactionId;
    };

    get initialAmount(): number {
        return this.props.initialAmount;
    };

    get receiptUrl(): string | null | undefined {
        return this.props.receiptUrl;
    };

    get receiptNumber(): string | null | undefined {
        return this.props.receiptNumber;
    };

    get receiptEmail(): string | null | undefined {
        return this.props.receiptEmail;
    };

    get customerEmail(): string | null | undefined {
        return this.props.customerEmail;
    };

    get description(): string | null | undefined {
        return this.props.description;
    };

    get userId(): string | null | undefined {
        return this.props.userId;
    };

    get providerId(): string | null | undefined {
        return this.props.providerId;
    };

    get updatedAt(): Date {
        return this.props.updatedAt;
    };

    // Business Methods

    getProps(): Readonly<PaymentProps> {
        return { ...this.props }
    };

    paymentRefunded(props: PaymentRefundedProps) {
        this.props.refundedAmount = props.refundedAmount;
        this.props.paymentStatus = PaymentStatus.REFUNDED;
        this.touch();
    };

}