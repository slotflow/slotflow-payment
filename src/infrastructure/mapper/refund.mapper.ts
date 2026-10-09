import { Types } from "mongoose";
import { IRefund } from "../models/refund.model";
import { Refund } from "../../domain/entities/refund.entity";

export class RefundMapper {
  static toDomain(doc: IRefund): Refund {
    return new Refund({
      _id: doc._id.toString(),
      idempotencyKey: doc.idempotencyKey,
      paymentId: doc.paymentId.toString(),
      refundId: doc.refundId,
      amount: doc.amount,
      refundStatus: doc.refundStatus,
      refundGateway: doc.refundGateway,
      reason: doc.reason,
      refundFor: doc.refundFor,
      reasonInDetail: doc.reasonInDetail,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(refund: Refund): Partial<IRefund> {
    const props = refund.getProps();
    return {
      idempotencyKey: props.idempotencyKey,
      paymentId: new Types.ObjectId(props.paymentId),
      refundId: props.refundId,
      amount: props.amount,
      refundStatus: props.refundStatus,
      refundGateway: props.refundGateway,
      reason: props.reason,
      refundFor: props.refundFor,
      reasonInDetail: props.reasonInDetail,
      metadata: props.metadata,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
