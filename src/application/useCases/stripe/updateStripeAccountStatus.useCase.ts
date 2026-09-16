import { AppError } from "../../../shared/error/appError";
import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { UpdateStripeAccountStatusInput } from "../../dtos/stripe.dtos";
import { PaymentAccountStatus } from "../../../domain/enums/payment.enum";
import { IPaymentAccountRepository } from "../../../domain/interfaces/repositories/IPaymentAccount.repository";

export class UpdateStripeAccountStatusUseCase {
    constructor(
        private readonly paymentAccountRepository: IPaymentAccountRepository
    ) { }

    async execute(input: UpdateStripeAccountStatusInput): Promise<void> {
        try {
            const { account } = input;

            const paymentAccount = await this.paymentAccountRepository.findByStripeAccountId({ stripeAccountId: account.id });
            if (!paymentAccount) {
                throw new AppError(
                    "Internal server error",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            let accountStatus: PaymentAccountStatus = PaymentAccountStatus.PENDING;

            if (!account.details_submitted) {
                accountStatus = PaymentAccountStatus.PENDING;
            } else if (!account.charges_enabled) {
                accountStatus = PaymentAccountStatus.RESTRICTED;
            } else if (account.charges_enabled && account.payouts_enabled) {
                accountStatus = PaymentAccountStatus.ACTIVE;
            };

            paymentAccount.updateStripeData({
                ...paymentAccount.stripeData,
                accountStatus
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
    };
}