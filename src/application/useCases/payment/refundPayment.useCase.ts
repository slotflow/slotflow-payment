import { v4 as uuidv4 } from 'uuid';
import { refundPaymentInput } from "../../dtos/payment.dtos";
import { Refund } from "../../../domain/entities/refund.entity";
import { RefundStatus } from "../../../domain/enums/refund.enum";
import { PaymentStatus } from "../../../domain/enums/payment.enum";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { IRefundRepository } from "../../../domain/interfaces/repositories/IRefund.repository";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";

export class RefundPaymentUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly refundRepository: IRefundRepository,
        private readonly paymentGateway: IPaymentGateway,
    ) { }

    async execute(input: refundPaymentInput): Promise<void> {
        try {
            const { bookingId, paymentId, reasonInDetail, refundFor, refundReason, userId } = input;
            if(!bookingId ||
                !paymentId ||
                !reasonInDetail ||
                !refundFor ||
                !refundReason ||
                !userId
            ) {
                throw new Error("Missing required fields");
            }

            const payment = await this.paymentRepository.findById(paymentId);
            if (!payment) {
                throw new Error("Payment not found");
            }

            if(!payment.paymentIntentId) {
                throw new Error()
            }

            if (payment.paymentStatus === PaymentStatus.REFUNDED) {
                throw new Error("Payment already refunded");
            }

            const refundAmount: number = Math.floor(payment.totalAmount / 2);

            const { refundId } = await this.paymentGateway.createRefund({
                paymentIntent: payment.paymentIntentId,
                refundAmount: refundAmount,
                reason: refundReason,
                metadata: {
                    bookingId,
                    paymentId,
                    reasonInDetail,
                    refundFor,
                }
            });

            const refund = Refund.create({
                idempotencyKey: uuidv4(),
                paymentId: paymentId,
                refundId: refundId,
                amount: refundAmount,
                refundStatus: RefundStatus.SUCCESS,
                refundGateway: payment.paymentGateway,
                reason: refundReason,
                refundFor: refundFor,
                reasonInDetail: reasonInDetail,
                metadata: {
                    bookingId,
                    userId
                }
            });

            await this.refundRepository.create(refund);

            payment.paymentRefunded({
                refundedAmount: (payment.refundedAmount || 0) + refundAmount
            });

            await this.paymentRepository.update(payment);

        } catch (error) {
            console.error("Refund failed:", error);
            throw error;
        }
    }
}