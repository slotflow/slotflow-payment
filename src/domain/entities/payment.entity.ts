import { PaymentProps } from "../contracts/payment.contract";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../enums/payment.enum";
import { CreateForBookingProps, CreateForSubscriptionProps, UpdatePaymentProps } from "../commands/payment.command";

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
            transactionId: props.transactionId,
            paymentStatus: props.paymentStatus,
            paymentMethod: props.paymentMethod,
            paymentGateway: props.paymentGateway,
            paymentFor: props.paymentFor,
            initialAmount: props.initialAmount,
            discountAmount: props.discountAmount,
            providerId: props.providerId,
            totalAmount: props.totalAmount,
            chargeId: props.chargeId ?? null,
            recieptUrl: props.recieptUrl ?? null,
            receiptNumber: props.receiptNumber ?? null,
            receiptEmail: props.receiptEmail ?? null,
            customerEmail: props.customerEmail ?? null,
            description: props.description ?? null,
            refundAmount: null,
            refundAt: null,
            refundId: null,
            refundReason: null,
            refundStatus: null,
            userId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    };

    static createForBooking(props: CreateForBookingProps) {
        return new Payment({
            _id: "",
            transactionId: props.transactionId,
            paymentStatus: props.paymentStatus,
            paymentMethod: props.paymentMethod,
            paymentGateway: props.paymentGateway,
            paymentFor: props.paymentFor,
            initialAmount: props.initialAmount,
            discountAmount: props.discountAmount,
            providerId: props.providerId,
            totalAmount: props.totalAmount,
            chargeId: props.chargeId ?? null,
            recieptUrl: props.recieptUrl ?? null,
            receiptNumber: props.receiptNumber ?? null,
            receiptEmail: props.receiptEmail ?? null,
            customerEmail: props.customerEmail ?? null,
            description: props.description ?? null,
            refundAmount: null,
            refundAt: null,
            refundId: null,
            refundReason: null,
            refundStatus: null,
            userId: props.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    };

    // Getters

    get _id(): string {
        return this.props._id
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

    get paymentMethod(): string {
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

    get recieptUrl(): string | null | undefined {
        return this.props.recieptUrl;
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

    get refundId(): string | null | undefined {
        return this.props.refundId;
    }

    get providerId(): string | null | undefined {
        return this.props.providerId;
    };

    get refundAmount(): number | null | undefined {
        return this.props.refundAmount;
    };

    get refundAt(): Date | null | undefined {
        return this.props.refundAt;
    };

    get refundReason(): string | null | undefined {
        return this.props.refundReason;
    };

    get refundStatus(): PaymentStatus | null | undefined {
        return this.props.refundStatus;
    };

    get updatedAt(): Date {
        return this.props.updatedAt;
    };

    // Business Methods

    getProps(): Readonly<PaymentProps> {
        return { ...this.props }
    };

    update(props: UpdatePaymentProps) {
        this.props = {
            ...this.props,
            ...props,
        };

        this.touch();
    };
}