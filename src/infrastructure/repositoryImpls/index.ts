import { RefundRepositoryImpl } from "./refund.repository.impl";
import { PaymentRepositoryImpl } from "./payment.repository.impl";
import { ProcessedEventRepositoryImpl } from "./processedEvent.repository.impl";
import { IRefundRepository } from "../../domain/interfaces/repositories/IRefund.repository";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { IProcessedEventRepository } from "../../domain/interfaces/repositories/IProcessedEvent.repository";

// payment repository instance
export const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();

// refund repository instance
export const refundRepository: IRefundRepository = new RefundRepositoryImpl();

// processed event repository instance
export const processedEventRepository: IProcessedEventRepository = new ProcessedEventRepositoryImpl();