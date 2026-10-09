import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { PaymentAccountStatus } from "../../../domain/enums/payment.enum";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { IPaymentGateway } from "../../interfaces/payment/IPaymentGateway.service";
import { GetStripeAccountStatusInput, GetStripeAccountStatusOutput } from "../../dtos/stripe.dtos";
import { IPaymentAccountRepository } from "../../../domain/interfaces/repositories/IPaymentAccount.repository";

export class GetStripeAccountStatusUseCase {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
    private readonly paymentAccountRepository: IPaymentAccountRepository,
  ) {}

  async execute(input: GetStripeAccountStatusInput): Promise<GetStripeAccountStatusOutput> {
    try {
      const { userId } = input;
      if (!userId) {
        throw new BadRequestError();
      }

      const paymentAccount = await this.paymentAccountRepository.findByUserId({ userId });
      if (!paymentAccount) {
        throw new AppError("Payment account not found", 404, false, ERROR_CODES.INTERNAL_ERROR);
      }

      let currentStatus: PaymentAccountStatus =
        paymentAccount.stripeData?.accountStatus || PaymentAccountStatus.NOT_CONNECTED;
      const stripeAccountId = paymentAccount.stripeData?.accountId;

      if (stripeAccountId && currentStatus === PaymentAccountStatus.PENDING) {
        const stripeAccount = await this.paymentGateway.getStripeAccount(stripeAccountId);
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
            accountStatus: currentStatus,
          });

          const updatedPaymentAccount = await this.paymentAccountRepository.update(paymentAccount);
          if (!updatedPaymentAccount) {
            throw new AppError(
              "Failed to update payment account status",
              500,
              false,
              ERROR_CODES.INTERNAL_ERROR,
            );
          }

          return {
            stripeStatus:
              updatedPaymentAccount.stripeData?.accountStatus ?? PaymentAccountStatus.PENDING,
          };
        }
      }

      return {
        stripeStatus: paymentAccount.stripeData?.accountStatus ?? PaymentAccountStatus.PENDING,
      };
    } catch (error: unknown) {
      throw toAppError(error, "Failed to get stripe account status");
    }
  }
}
