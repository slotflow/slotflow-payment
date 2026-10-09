import { Refund } from "../../entities/refund.entity";

export interface IRefundRepository {
  create(refund: Refund): Promise<Refund>;

  findById(id: string): Promise<Refund | null>;

  findByRefundId(refundId: string): Promise<Refund | null>;

  findByPaymentId(paymentId: string): Promise<Refund[]>;

  findByIdempotencyKey(key: string): Promise<Refund | null>;

  update(refund: Refund): Promise<Refund | null>;
}
