import { Role } from "../../../../domain/enums/common.enum";
import { BookingCheckoutInput } from "../../../dtos/payment.dtos";
import { ERROR_CODES } from "../../../../shared/utils/types/enums";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { callbackUrlsConfig, serviceConfig } from "../../../../config/env";
import { PaymentAccountStatus } from "../../../../domain/enums/payment.enum";
import { AppError, BadRequestError } from "../../../../shared/error/appError";
import { PaymentAccount } from "../../../../domain/entities/paymentAccount.entity";
import { IPaymentGateway } from "../../../interfaces/payment/IPaymentGateway.service";
import { CreateStripeCustomerUseCase } from "../../stripe/createStripeCustomer.useCase";
import { IPaymentAccountRepository } from "../../../../domain/interfaces/repositories/IPaymentAccount.repository";

export class BookingCheckoutUseCase {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
    private readonly createStripeCustomer: CreateStripeCustomerUseCase,
    private readonly paymenttAccountRepository: IPaymentAccountRepository,
  ) {}

  async execute(input: BookingCheckoutInput): Promise<string> {
    try {
      const {
        serviceName,
        description,
        unitAmount,
        providerId,
        bookingId,
        userId,
        paymentFor,
        email,
        name,
      } = input;

      if (
        !serviceName ||
        !description ||
        !unitAmount ||
        !providerId ||
        !bookingId ||
        !userId ||
        !paymentFor ||
        !email ||
        !name
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
          role: Role.USER,
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

      const result = await this.paymentGateway.createBookingCheckoutSession({
        serviceName,
        description,
        unitAmount,
        providerId,
        bookingId,
        userId,
        paymentFor,
        userEmail: email,
        userName: name,
        stripeCustomerId,
        successUrl: serviceConfig.frontendUrl + callbackUrlsConfig.bookingUrl + `?status=success`,
        cancelUrl: serviceConfig.frontendUrl + callbackUrlsConfig.bookingUrl + `?status=failed`,
      });

      return result.sessionId;
    } catch (error: unknown) {
      throw toAppError(error, "Failed to booking checkout");
    }
  }
}
