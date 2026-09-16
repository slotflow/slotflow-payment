import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { PaymentAccountStatus } from "../../../domain/enums/payment.enum";
import { AppError, BadRequestError } from '../../../shared/error/appError';
import { PaymentAccount } from "../../../domain/entities/paymentAccount.entity";
import { IPaymentGateway } from '../../../domain/interfaces/payment/IPaymentGateway';
import { StripeAccountLinkInput, StripeAccountLinkOutput } from "../../dtos/stripe.dtos";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IPaymentAccountRepository } from "../../../domain/interfaces/repositories/IPaymentAccount.repository";

export class StripeAccountLinkUseCase {
    constructor(
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly paymentGateway: IPaymentGateway,
        private readonly paymentAccountRepository: IPaymentAccountRepository
    ) { };

    async execute(input: StripeAccountLinkInput): Promise<StripeAccountLinkOutput> {
        try {
            console.log("StripeAccountLinkUseCase start")
            const { email, userId } = input
            if (!userId || !email) {
                throw new BadRequestError();
            }

            const { account } = await this.paymentGateway.createStripeAccount({ email });
            if (!account.id) {
                throw new AppError(
                    "Failed to get stripe ccountId",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                )
            };

            const existingPaymentAccount = await this.paymentAccountRepository.findByUserId({ userId });
            let accountEntity: PaymentAccount | null = null;
            if (existingPaymentAccount) {
                if (existingPaymentAccount.stripeData?.accountId) {
                    accountEntity = existingPaymentAccount;
                }
            } else {
                const existingStripeAccount = await this.paymentAccountRepository.findByStripeAccountId({ stripeAccountId: account.id });
                if (!existingStripeAccount) {
                    const paymentAccount = PaymentAccount.create({ userId })
                    paymentAccount.updateStripeData({
                        accountStatus: PaymentAccountStatus.PENDING,
                        accountId: account.id,
                        customerId: null,
                    })

                    const newPaymentAccount = await this.paymentAccountRepository.create(paymentAccount);
                    if (!newPaymentAccount) {
                        throw new AppError(
                            "Internal server error",
                            500,
                            false,
                            ERROR_CODES.INTERNAL_ERROR
                        );
                    }
                    accountEntity = newPaymentAccount;
                }
            }

            const { accountLinkData } = await this.paymentGateway.createStripeAccountLink({
                accountId: account.id
            });

            return {
                accountLink: accountLinkData.url,
                accountId: account.id
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create stripe account link");
        };
    };
};