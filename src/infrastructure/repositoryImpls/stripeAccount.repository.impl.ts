import { StripeAccountModel } from "../models/stripeAccount.model";
import { StripeAccountMapper } from "../mapper/stripeAccount.mapper";
import { StripeAccount } from "../../domain/entities/stripeAccount.entity";
import { IStripeAccountRepository } from "../../domain/interfaces/repositories/IStripeAccount.repository";

export class StripeAccountRepositoryImpl implements IStripeAccountRepository {

    async create(stripeAccount: StripeAccount): Promise<StripeAccount> {
        const persistence = StripeAccountMapper.toPersistence(stripeAccount);
        const doc = await StripeAccountModel.create(persistence);

        return StripeAccountMapper.toDomain(doc);
    }

    async findByStripeAccountId({stripeAccountId}: {stripeAccountId:string}): Promise<StripeAccount | null> {
        const doc = await StripeAccountModel.findOne({ stripeAccountId : stripeAccountId })
        console.log("doc : ",doc)
        return doc ? StripeAccountMapper.toDomain(doc) : null;
    }

    async findByUserId({userId}: {userId:string}): Promise<StripeAccount | null> {
        const doc = await StripeAccountModel.findOne({ userId });

        return doc ? StripeAccountMapper.toDomain(doc) : null;
    }

    async deleteByStripeAccountId({stripeAccountId}: {stripeAccountId:string}): Promise<void> {
        await StripeAccountModel.deleteOne({ stripeAccountId });
    }
}