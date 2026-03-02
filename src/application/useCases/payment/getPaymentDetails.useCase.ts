import { log } from "../../../shared/logger/logger";
import { GetPaymentDetailsRequest, GetPaymentDetailsResponse } from "../../dtos/payment.dtos";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";

export class GetPaymentDetailsUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository
    ) { };

    async execute(payload: GetPaymentDetailsRequest): Promise<GetPaymentDetailsResponse> {
        const { paymentId } = payload;
        try {
            const result = await this.paymentRepository.findById(paymentId);
            const data = {
                transactionId: result?.transactionId,
                paymentStatus: result?.paymentStatus,
                paymentMethod: result?.paymentMethod,
                paymentGateway: result?.paymentGateway,
                paymentFor: result?.paymentFor,
                initialAmount: result?.initialAmount,
                discountAmount: result?.discountAmount,
                totalAmount: result?.totalAmount,
                userId: result?.userId,
                providerId: result?.providerId,
                refundId: result?.refundId,
                refundAmount: result?.refundAmount,
                refundStatus: result?.refundStatus,
                refundAt: result?.refundAt,
                refundReason: result?.refundReason,
                recieptUrl: result?.recieptUrl,
                customerEmail: result?.customerEmail,
                description: result?.description,
                createdAt: result?.createdAt,
            }

            return data as GetPaymentDetailsResponse;
        } catch (error) {
            log.error("GetPaymentDetailsUseCase failed", error as Error);
            throw error;
        }
    }
}