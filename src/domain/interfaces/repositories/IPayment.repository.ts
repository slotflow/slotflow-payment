import { Payment } from "../../entities/payment.entity";

export interface IPaymentRepository {

    create(payment: Payment): Promise<Payment>;

    update(payment: Payment): Promise<Payment | null>;

    findById(payemtnId: string): Promise<Payment | null>;

    findByInvoiceId(invoiceId: string): Promise<Payment | null>;

    findAll(page: number, limit: number, userId?: string, providerId?: string): Promise<{ items: Array<Payment>, totalPages: number; currentPage: number; totalCount: number; }>;

};
