import { RefundProps } from "../contracts/refund.contract";
import { PaymentGateway } from "../enums/payment.enum";
import { RefundFor, RefundReason, RefundStatus } from "../enums/refund.enum";

export class Refund {
    private props: RefundProps;

    constructor(props: RefundProps) {
        this.props = props;
    }

    static create(props: Omit<RefundProps, "_id" | "createdAt" | "updatedAt">): Refund {
        const now = new Date();
        return new Refund({
            ...props,
            _id: "",
            createdAt: now,
            updatedAt: now,
        });
    }

    get _id(): string {
        return this.props._id;
    }

    get idempotencyKey(): string {
        return this.props.idempotencyKey;
    }

    get paymentId(): string {
        return this.props.paymentId;
    }

    get refundId(): string {
        return this.props.refundId;
    }

    get amount(): number {
        return this.props.amount;
    }

    get refundStatus(): RefundStatus {
        return this.props.refundStatus;
    }

    get refundGateway(): PaymentGateway {
        return this.props.refundGateway;
    }

    get reason(): RefundReason {
        return this.props.reason;
    }

    get refundFor(): RefundFor {
        return this.props.refundFor;
    }

    get reasonInDetail(): string {
        return this.props.reasonInDetail;
    }

    get metadata(): Record<string, string> | undefined {
        return this.props.metadata;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    public getProps(): RefundProps {
        return { ...this.props };
    }
}
