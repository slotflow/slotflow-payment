import { PaymentRepositoryImpl } from "./payment.repository.impl";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";

export const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();