import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { PaymentAccountStatus } from "../../../domain/enums/payment.enum";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { GetStripeAccountStatusInput, GetStripeAccountStatusOutput } from "../../dtos/stripe.dtos";
import { IPaymentAccountRepository } from "../../../domain/interfaces/repositories/IPaymentAccount.repository";

export class GetStripeAccountStatusUseCase {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
    private readonly paymentAccountRepository: IPaymentAccountRepository
  ) {}

  async execute(input: GetStripeAccountStatusInput): Promise<GetStripeAccountStatusOutput> {
    try {
      const { accountId } = input;
      if (!accountId) {
        throw new BadRequestError("Stripe account ID is required");
      }

      const paymentAccount = await this.paymentAccountRepository.findByStripeAccountId({
        stripeAccountId: accountId
      });

      if (!paymentAccount) {
        throw new AppError(
          "Payment account not found",
          404,
          false,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      const stripeAccount = await this.paymentGateway.getStripeAccount(accountId);

      let currentStatus: PaymentAccountStatus = PaymentAccountStatus.PENDING;

      if (!stripeAccount.details_submitted) {
        currentStatus = PaymentAccountStatus.PENDING;
      } else if (!stripeAccount.charges_enabled || !stripeAccount.payouts_enabled) {
        currentStatus = PaymentAccountStatus.RESTRICTED;
      } else if (stripeAccount.charges_enabled && stripeAccount.payouts_enabled) {
        currentStatus = PaymentAccountStatus.ACTIVE;
      }

      if (paymentAccount.stripeData?.accountStatus !== currentStatus) {
        paymentAccount.updateStripeData({
          ...paymentAccount.stripeData,
          accountStatus: currentStatus
        });

        const updatedPaymentAccount = await this.paymentAccountRepository.update(paymentAccount);
        if (!updatedPaymentAccount) {
          throw new AppError(
            "Failed to update payment account status",
            500,
            false,
            ERROR_CODES.INTERNAL_ERROR
          );
        }

        return {
          accountStatus: updatedPaymentAccount.stripeData?.accountStatus ?? PaymentAccountStatus.PENDING
        };
      }

      return {
        accountStatus: paymentAccount.stripeData?.accountStatus ?? PaymentAccountStatus.PENDING
      };

    } catch (error: unknown) {
      throw toAppError(error, "Failed to get stripe account status");
    }
  }
}