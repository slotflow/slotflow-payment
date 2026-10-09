import { Role } from "../../../../domain/enums/common.enum";
import { ERROR_CODES } from "../../../../shared/utils/types/enums";
import { SubscriptionCheckoutInput } from "../../../dtos/payment.dtos";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { callbackUrlsConfig, serviceConfig } from "../../../../config/env";
import { PaymentAccountStatus } from "../../../../domain/enums/payment.enum";
import { AppError, BadRequestError } from "../../../../shared/error/appError";
import { PaymentAccount } from "../../../../domain/entities/paymentAccount.entity";
import { CreateStripeCustomerUseCase } from "../../stripe/createStripeCustomer.useCase";
import { IPaymentGateway } from "../../../interfaces/payment/IPaymentGateway.service.ts";
import { IPaymentAccountRepository } from "../../../../domain/interfaces/repositories/IPaymentAccount.repository";

export class SubscriptionCheckoutUseCase {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
    private readonly createStripeCustomer: CreateStripeCustomerUseCase,
    private readonly paymenttAccountRepository: IPaymentAccountRepository,
  ) {}

  async execute(input: SubscriptionCheckoutInput): Promise<string> {
    try {
      const {
        subscriptionId,
        billingCycle,
        paymentFor,
        unitAmount,
        paymentDate,
        name,
        email,
        role,
        priceId,
        userId,
        trialPeriodDays,
        alreadyUsedTrial,
        isTrial,
      } = input;

      if (
        !subscriptionId ||
        !userId ||
        !billingCycle ||
        unitAmount < 0 ||
        !paymentFor ||
        !name ||
        !email ||
        !paymentDate ||
        !role ||
        !priceId
      ) {
        throw new BadRequestError();
      }

      let paymentAccount = await this.paymenttAccountRepository.findByUserId({ userId });
      if (!paymentAccount) {
        const newAccount = PaymentAccount.create({ userId });

        paymentAccount = await this.paymenttAccountRepository.create(newAccount);

        if (!paymentAccount) {
          throw new AppError(
            "Failed to create payment account",
            500,
            true,
            ERROR_CODES.INTERNAL_ERROR,
          );
        }
      }

      let stripeCustomerId = paymentAccount?.stripeData?.customerId;

      if (!stripeCustomerId) {
        const customer = await this.createStripeCustomer.execute({
          email,
          username: name,
          userId,
          role: Role.PROVIDER,
        });

        if (!customer) {
          throw new AppError("Internal server error", 500, true, ERROR_CODES.INTERNAL_ERROR);
        }

        paymentAccount.updateStripeData({
          accountId: paymentAccount.stripeData?.accountId,
          customerId: customer.stripeCustomerId,
          accountStatus:
            paymentAccount.stripeData?.accountStatus || PaymentAccountStatus.NOT_CONNECTED,
        });

        const updatedPaymentAccount = await this.paymenttAccountRepository.update(paymentAccount);
        if (!updatedPaymentAccount) {
          throw new AppError("Internal server error", 500, true, ERROR_CODES.INTERNAL_ERROR);
        }

        stripeCustomerId = customer.stripeCustomerId;
      }

      const result = await this.paymentGateway.createSubscriptionCheckoutSession({
        subscriptionId,
        userId,
        billingCycle,
        unitAmount,
        paymentFor,
        priceId,
        userName: name,
        userEmail: email,
        stripeCustomerId,
        trialPeriodDays: trialPeriodDays > 0 ? trialPeriodDays : undefined,
        alreadyUsedTrial,
        isTrial,
        successUrl:
          serviceConfig.frontendUrl + callbackUrlsConfig.subscriptionUrl + `?status=success`,
        cancelUrl:
          serviceConfig.frontendUrl + callbackUrlsConfig.subscriptionUrl + `?status=failed`,
      });

      return result.sessionId;
    } catch (error: unknown) {
      throw toAppError(error, "Failed to create subscription checkout");
    }
  }
}
