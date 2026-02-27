import { log } from "../../../shared/logger/logger";
import { ApiResponse } from "../../dtos/common.dtos";
import { GetPaymentsResponse, GetPaymentsRequest } from "../../dtos/payment.dtos";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";

export class GetPaymentsUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
    ) { };

    async execute(payload: GetPaymentsRequest): Promise<ApiResponse<GetPaymentsResponse>> {
        const { providerId, userId, page, limit } = payload;

        try {
            const result = await this.paymentRepository.findAll(page, limit, userId, providerId);
            const { data: payments, currentPage, totalCount, totalPages } = result;

            return {
                data: payments.map(payment => ({
                    _id: payment._id,
                    createdAt: payment.createdAt,
                    totalAmount: payment.totalAmount,
                    paymentFor: payment.paymentFor,
                    paymentStatus: payment.paymentStatus,
                    paymentMethod: payment.paymentMethod,
                    discountAmount: payment.discountAmount,
                })),
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error) {
            log.error("GetPaymentsUseCase failed", error as Error);
            throw error;
        };
    };
};