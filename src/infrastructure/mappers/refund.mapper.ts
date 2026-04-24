import { Types } from "mongoose";
import { Refund } from "../../domain/entities/refund.entity";
import { IRefund } from "../models/refund.model";

export class RefundMapper {
    static toDomain(raw: IRefund): Refund {
        return new Refund({
            _id: raw._id.toString(),
            idempotencyKey: raw.idempotencyKey,
            paymentId: raw.paymentId.toString(),
            refundId: raw.refundId,
            amount: raw.amount,
            refundStatus: raw.refundStatus,
            refundGateway: raw.refundGateway,
            reason: raw.reason,
            refundFor: raw.refundFor,
            reasonInDetail: raw.reasonInDetail,
            metadata: raw.metadata,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(domain: Refund): Partial<IRefund> {
        const props = domain.getProps();
        return {
            idempotencyKey: props.idempotencyKey,
            paymentId: new Types.ObjectId(props.paymentId) as any,
            refundId: props.refundId,
            amount: props.amount,
            refundStatus: props.refundStatus,
            refundGateway: props.refundGateway,
            reason: props.reason,
            refundFor: props.refundFor,
            reasonInDetail: props.reasonInDetail,
            metadata: props.metadata,
        };
    }
}
