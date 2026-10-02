import { toAppError } from '../../../shared/error/handleUnknownError';
import { ERROR_CODES, IdType } from '../../../shared/utils/types/enums';
import { PaymentAccountStatus } from "../../../domain/enums/payment.enum";
import { AppError, BadRequestError } from '../../../shared/error/appError';
import { PaymentAccount } from "../../../domain/entities/paymentAccount.entity";
import { IPaymentGateway } from '../../interfaces/payment/IPaymentGateway.service';
import { StripeAccountLinkInput, StripeAccountLinkOutput } from "../../dtos/stripe.dtos";
import { IPaymentAccountRepository } from "../../../domain/interfaces/repositories/IPaymentAccount.repository";

export class StripeAccountLinkUseCase {
    constructor(
        private readonly paymentGateway: IPaymentGateway,
        private readonly paymentAccountRepository: IPaymentAccountRepository
    ) { };

    async execute(input: StripeAccountLinkInput): Promise<StripeAccountLinkOutput> {
        try {
            const { email, userId } = input
            if (!userId || !email) {
                throw new BadRequestError();
            }

            let paymentAccount = await this.paymentAccountRepository.findByUserId({ userId });
            let stripeAccountId = paymentAccount?.stripeData?.accountId;

            if (!stripeAccountId) {
                const { account } = await this.paymentGateway.createStripeAccount({ email });
                if (!account.id) {
                    throw new AppError(
                        "Failed to create Stripe account",
                        500,
                        false,
                        ERROR_CODES.INTERNAL_ERROR
                    );
                }
                stripeAccountId = account.id;

                if (!paymentAccount) {
                    paymentAccount = PaymentAccount.create({ userId });
                }

                paymentAccount.updateStripeData({
                    ...paymentAccount.stripeData,
                    accountStatus: PaymentAccountStatus.PENDING,
                    accountId: stripeAccountId,
                    customerId: paymentAccount.stripeData?.customerId ?? null
                });

                const savedAccount = paymentAccount._id
                    ? await this.paymentAccountRepository.update(paymentAccount)
                    : await this.paymentAccountRepository.create(paymentAccount);

                if (!savedAccount) {
                    throw new AppError(
                        "Failed to save payment account details",
                        500,
                        false,
                        ERROR_CODES.INTERNAL_ERROR
                    );
                }
            }

            const { accountLinkData } = await this.paymentGateway.createStripeAccountLink({
                accountId: stripeAccountId
            });

            return {
                boardingUrl: accountLinkData.url
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create stripe account link");
        };
    };
};