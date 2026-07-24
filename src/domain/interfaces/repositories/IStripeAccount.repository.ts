import { StripeAccount } from "../../entities/stripeAccount.entity";

export interface IStripeAccountRepository {
    create(stripeAccount: StripeAccount): Promise<StripeAccount>;

    findByStripeAccountId({stripeAccountId}: {stripeAccountId:string}): Promise<StripeAccount | null>;

    findByUserId({userId}: {userId:string}): Promise<StripeAccount | null>;

    deleteByStripeAccountId({stripeAccountId}: {stripeAccountId:string}): Promise<void>;
}