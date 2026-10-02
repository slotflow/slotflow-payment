import { AppError } from "../../../shared/error/appError";
import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { StripeAccountRevokedInput } from "../../dtos/stripe.dtos";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { PaymentAccountStatus } from "../../../domain/enums/payment.enum";
import { IPaymentAccountRepository } from "../../../domain/interfaces/repositories/IPaymentAccount.repository";

export class StripeAccountRevokedUseCase {
    constructor(
        private readonly paymentAccountRepository: IPaymentAccountRepository
    ) { }

    async execute(input: StripeAccountRevokedInput): Promise<void> {
        try {
            const { accountId } = input;

            const paymentAccount = await this.paymentAccountRepository.findByStripeAccountId({ stripeAccountId: accountId });
            if (!paymentAccount) {
                throw new AppError(
                    "Internal server error",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            paymentAccount.updateStripeData({
                ...paymentAccount.stripeData,
                accountStatus: PaymentAccountStatus.REVOKED,
            });

            const updatedPaymentAccount = await this.paymentAccountRepository.update(paymentAccount);
            if (!updatedPaymentAccount) {
                throw new AppError(
                    "Internal server error",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

        } catch (error: unknown) {
            throw toAppError(error, "Failed to update stripe account status");
        }
    }
}