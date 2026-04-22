import { RefundRepositoryImpl } from "./refund.repository.impl";
import { PaymentRepositoryImpl } from "./payment.repository.impl";
import { IRefundRepository } from "../../domain/interfaces/repositories/IRefund.repository";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";

export const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();

export const refundRepository: IRefundRepository = new RefundRepositoryImpl();