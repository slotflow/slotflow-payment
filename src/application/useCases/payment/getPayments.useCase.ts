import { TableData } from "../../dtos/common.dtos";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetPaymentsOutput, GetPaymentsInput } from "../../dtos/payment.dtos";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";

export class GetPaymentsUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
    ) { };

    async execute(input: GetPaymentsInput): Promise<TableData<GetPaymentsOutput>> {
        try {
            const { providerId, userId, page, limit } = input;

            const result = await this.paymentRepository.findAll(page, limit, userId, providerId);
            const { items: payments, currentPage, totalCount, totalPages } = result;

            return {
                items: payments.map(payment => ({
                    _id: payment._id,
                    createdAt: payment.createdAt,
                    totalAmount: payment.totalAmount,
                    paymentFor: payment.paymentFor,
                    paymentStatus: payment.paymentStatus,
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