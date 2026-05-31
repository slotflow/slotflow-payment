import { IStripeAccount } from "../models/stripeAccount.model";
import { StripeAccount } from "../../domain/entities/stripeAccount.entity";

export class StripeAccountMapper {
    static toDomain(doc: IStripeAccount): StripeAccount {
        return new StripeAccount({
            _id: doc._id.toString(),
            userId: doc.userId,
            stripeAccountId: doc.stripeAccountId,
            stripeCustomerId: doc.stripeCustomerId,
            stripeAccountStatus: doc.stripeAccountStatus,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    static toPersistence(stripeAccount: StripeAccount): Partial<IStripeAccount> {
        const props = stripeAccount.getProps();
        return {
            userId: props.userId,
            stripeAccountId: props.stripeAccountId,
            stripeCustomerId: props.stripeCustomerId ?? null,
            stripeAccountStatus: props.stripeAccountStatus,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt
        };
    }
}