import { Refund } from "../../domain/entities/refund.entity";
import { IRefundRepository } from "../../domain/interfaces/repositories/IRefund.repository";
import { RefundMapper } from "../mapper/refund.mapper";
import { RefundModel } from "../models/refund.model";

export class RefundRepositoryImpl implements IRefundRepository {
    async create(refund: Refund): Promise<Refund> {
        const persistence = RefundMapper.toPersistence(refund);
        const doc = await RefundModel.create(persistence);
        return RefundMapper.toDomain(doc);
    }

    async findById(id: string): Promise<Refund | null> {
        const doc = await RefundModel.findById(id);
        return doc ? RefundMapper.toDomain(doc) : null;
    }

    async findByPaymentId(paymentId: string): Promise<Refund[]> {
        const docs = await RefundModel.find({ paymentId });
        return docs.map(doc => RefundMapper.toDomain(doc));
    }

    async update(refund: Refund): Promise<Refund | null> {
        const persistence = RefundMapper.toPersistence(refund);
        const doc = await RefundModel.findByIdAndUpdate(
            refund._id,
            persistence,
            { new: true }
        );
        return doc ? RefundMapper.toDomain(doc) : null;
    }
}
