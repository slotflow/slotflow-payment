import { ApiResponse } from "../../dtos/common.dtos";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetPaymentsOutput, GetPaymentsInput } from "../../dtos/payment.dtos";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";

export class GetPaymentsUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
    ) { };

    async execute(input: GetPaymentsInput): Promise<ApiResponse<GetPaymentsOutput>> {
        try {
            const { providerId, userId, page, limit } = input;
            if (!providerId && !userId) {
                throw new BadRequestError("Provider ID or User ID must be provided");
            }

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
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get payments");
        };
    };
};