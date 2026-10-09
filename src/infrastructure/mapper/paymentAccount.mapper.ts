import { IPaymentAccount } from "../models/paymentAccount.model";
import { PaymentAccount } from "../../domain/entities/paymentAccount.entity";
import { PaymentAccountProps } from "../../domain/contracts/paymentAccount.contract";

export class PaymentAccountMapper {
  static toDomain(doc: IPaymentAccount): PaymentAccount {
    const props: PaymentAccountProps = {
      _id: doc._id.toString(),
      userId: doc.userId,
      stripeData: doc.stripeData
        ? {
            customerId: doc.stripeData.customerId ?? null,
            accountId: doc.stripeData.accountId ?? null,
            accountStatus: doc.stripeData.accountStatus,
          }
        : null,
      paypalData: doc.paypalData
        ? {
            payerId: doc.paypalData.payerId ?? null,
            merchantId: doc.paypalData.merchantId ?? null,
            accountStatus: doc.paypalData.accountStatus,
          }
        : null,
      razorpayData: doc.razorpayData
        ? {
            customerId: doc.razorpayData.customerId ?? null,
            accountId: doc.razorpayData.accountId ?? null,
            accountStatus: doc.razorpayData.accountStatus,
          }
        : null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return new PaymentAccount(props);
  }

  static toPersistence(entity: PaymentAccount): Partial<IPaymentAccount> {
    const props = entity.getProps();

    return {
      userId: props.userId,
      stripeData: props.stripeData
        ? {
            customerId: props.stripeData.customerId ?? null,
            accountId: props.stripeData.accountId ?? null,
            accountStatus: props.stripeData.accountStatus,
          }
        : null,
      paypalData: props.paypalData
        ? {
            payerId: props.paypalData.payerId ?? null,
            merchantId: props.paypalData.merchantId ?? null,
            accountStatus: props.paypalData.accountStatus,
          }
        : null,
      razorpayData: props.razorpayData
        ? {
            customerId: props.razorpayData.customerId ?? null,
            accountId: props.razorpayData.accountId ?? null,
            accountStatus: props.razorpayData.accountStatus,
          }
        : null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
