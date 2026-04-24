import { ERROR_CODES } from "../../../shared/utils/type";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { GetPaymentDetailsRequest, GetPaymentDetailsResponse } from "../../dtos/payment.dtos";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";

export class GetPaymentDetailsUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository
    ) { };

    async execute(payload: GetPaymentDetailsRequest): Promise<GetPaymentDetailsResponse> {
        try {
            const { paymentId } = payload;
            if (!paymentId) {
                throw new BadRequestError("Payment ID is required");
            }

            const payment = await this.paymentRepository.findById(paymentId);
            if(!payment){
                throw new NotFoundError(
                    "Payment not found",
                    ERROR_CODES.PAYMENT_NOT_FOUND
                );
            }
            
            const data = {
                transactionId: payment?.transactionId,
                paymentStatus: payment?.paymentStatus,
                paymentMethod: payment?.paymentMethod,
                paymentGateway: payment?.paymentGateway,
                paymentFor: payment?.paymentFor,
                initialAmount: payment?.initialAmount,
                discountAmount: payment?.discountAmount,
                totalAmount: payment?.totalAmount,
                userId: payment?.userId,
                providerId: payment?.providerId,
                receiptUrl: payment?.receiptUrl,
                customerEmail: payment?.customerEmail,
                description: payment?.description,
                createdAt: payment?.createdAt,
            }

            return data as GetPaymentDetailsResponse;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get payment details");
        }
    }
}