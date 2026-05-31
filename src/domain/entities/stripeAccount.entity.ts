import { StripeAccountStatus } from "../enums/payment.enum";
import { StripeAccountProps } from "../contracts/stripeAccount";
import { CreateStripeAccountProps } from "../commands/stripeAccount.commands";

export class StripeAccount {
    private props: StripeAccountProps;

    constructor(props: StripeAccountProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static create(props: CreateStripeAccountProps): StripeAccount {
        return new StripeAccount({
            _id: "",
            userId: props.userId,
            stripeAccountId: props.stripeAccountId,
            stripeCustomerId: props.stripeCustomerId ?? null,
            stripeAccountStatus: props.stripeAccountStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Business Methods

    getProps(): StripeAccountProps {
        return this.props;
    };

    get stripeAccountId(): string | null {
        return this.props.stripeAccountId;
    }

    get stripeCustomerId(): string | null | undefined {
        return this.props.stripeCustomerId;
    }

    get stripeAccountStatus(): StripeAccountStatus {
        return this.props.stripeAccountStatus;
    }

    get userId(): string {
        return this.props.userId;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

}