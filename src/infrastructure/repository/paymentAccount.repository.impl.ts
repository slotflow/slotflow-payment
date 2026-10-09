import { PaymentAccountModel } from "../models/paymentAccount.model";
import { PaymentAccountMapper } from "../mapper/paymentAccount.mapper";
import { PaymentAccount } from "../../domain/entities/paymentAccount.entity";
import { IPaymentAccountRepository } from "../../domain/interfaces/repositories/IPaymentAccount.repository";

export class PaymentAccountRepositoryImpl implements IPaymentAccountRepository {
  async create(paymentAccount: PaymentAccount): Promise<PaymentAccount> {
    const persistence = PaymentAccountMapper.toPersistence(paymentAccount);
    const doc = await PaymentAccountModel.create(persistence);

    return PaymentAccountMapper.toDomain(doc);
  }

  async findByUserId({ userId }: { userId: string }): Promise<PaymentAccount | null> {
    const doc = await PaymentAccountModel.findOne({ userId });

    return doc ? PaymentAccountMapper.toDomain(doc) : null;
  }

  async update(paymentAccount: PaymentAccount): Promise<PaymentAccount> {
    const persistence = PaymentAccountMapper.toPersistence(paymentAccount);
    const doc = await PaymentAccountModel.findOneAndUpdate(
      { userId: paymentAccount.userId },
      { $set: persistence },
      { new: true },
    );

    if (!doc) {
      throw new Error(`PaymentAccount not found for userId: ${paymentAccount.userId}`);
    }

    return PaymentAccountMapper.toDomain(doc);
  }

  async findByStripeAccountId({
    stripeAccountId,
  }: {
    stripeAccountId: string;
  }): Promise<PaymentAccount | null> {
    const doc = await PaymentAccountModel.findOne({ "stripeData.accountId": stripeAccountId });

    return doc ? PaymentAccountMapper.toDomain(doc) : null;
  }

  async findByStripeCustomerId({
    stripeCustomerId,
  }: {
    stripeCustomerId: string;
  }): Promise<PaymentAccount | null> {
    const doc = await PaymentAccountModel.findOne({ "stripeData.customerId": stripeCustomerId });

    return doc ? PaymentAccountMapper.toDomain(doc) : null;
  }

  async findByPaypalMerchantId({
    paypalMerchantId,
  }: {
    paypalMerchantId: string;
  }): Promise<PaymentAccount | null> {
    const doc = await PaymentAccountModel.findOne({ "paypalData.merchantId": paypalMerchantId });

    return doc ? PaymentAccountMapper.toDomain(doc) : null;
  }

  async findByPaypalPayerId({
    paypalPayerId,
  }: {
    paypalPayerId: string;
  }): Promise<PaymentAccount | null> {
    const doc = await PaymentAccountModel.findOne({ "paypalData.payerId": paypalPayerId });

    return doc ? PaymentAccountMapper.toDomain(doc) : null;
  }

  async findByRazorpayAccountId({
    razorpayAccountId,
  }: {
    razorpayAccountId: string;
  }): Promise<PaymentAccount | null> {
    const doc = await PaymentAccountModel.findOne({ "razorpayData.accountId": razorpayAccountId });

    return doc ? PaymentAccountMapper.toDomain(doc) : null;
  }

  async findByRazorpayCustomerId({
    razorpayCustomerId,
  }: {
    razorpayCustomerId: string;
  }): Promise<PaymentAccount | null> {
    const doc = await PaymentAccountModel.findOne({
      "razorpayData.customerId": razorpayCustomerId,
    });

    return doc ? PaymentAccountMapper.toDomain(doc) : null;
  }
}
