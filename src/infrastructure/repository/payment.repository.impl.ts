import { PaymentModel } from "../models/payment.model";
import { PaymentMapper } from "../mapper/payment.mapper";
import { Payment } from "../../domain/entities/payment.entity";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";

export class PaymentRepositoryImpl implements IPaymentRepository {

    async create(payment: Payment): Promise<Payment> {
        const persistence = PaymentMapper.toPersistence(payment);
        const doc = await PaymentModel.create(persistence);
        return PaymentMapper.toDomain(doc);
    };

    async findById(payemtnId: string): Promise<Payment | null> {
        const doc = await PaymentModel.findById(payemtnId);
        return doc ? PaymentMapper.toDomain(doc) : null;
    };

    async update(payment: Payment): Promise<Payment | null> {
        const persistence = PaymentMapper.toPersistence(payment);

        const doc = await PaymentModel.findByIdAndUpdate(
            payment._id,
            { $set: persistence },
            { new: true }
        );

        return doc ? PaymentMapper.toDomain(doc) : null;
    };

    async findByInvoiceId(invoiceId: string): Promise<Payment | null> {
        const doc = await PaymentModel.findOne({ stripeInvoiceId : invoiceId });
        return doc ? PaymentMapper.toDomain(doc) : null;
    }

    async findAll(page: number, limit: number, userId?: string, providerId?: string): Promise<{ items: Array<Payment>, totalPages: number; currentPage: number; totalCount: number; }> {
        const skip = (page - 1) * limit;

        const filter: {
            userId?: string;
            providerId?: string;
        } = {};

        if (userId) {
            filter.userId = userId;
        }

        if (providerId) {
            filter.providerId = providerId;
        }

        const [payments, totalCount] = await Promise.all([
            PaymentModel.find(filter, {
                _id: 1,
                createdAt: 1,
                totalAmount: 1,
                paymentFor: 1,
                paymentMethod: 1,
                paymentStatus: 1,
                discountAmount: 1,
            }).skip(skip).limit(limit).sort({ createdAt: 1 }),
            PaymentModel.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            items: payments.map(payment => PaymentMapper.toDomain(payment)),
            totalPages,
            currentPage: page,
            totalCount
        }

    };

};