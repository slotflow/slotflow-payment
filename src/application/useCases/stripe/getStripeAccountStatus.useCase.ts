import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { StripeAccountStatus } from "../../../domain/enums/payment.enum";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { GetStripeAccountStatusInput, GetStripeAccountStatusOutput } from "../../dtos/stripe.dtos";
import { IStripeAccountRepository } from "../../../domain/interfaces/repositories/IStripeAccount.repository";

export class GetStripeAccountStatusUseCase {

    constructor(
        private readonly paymentGateway: IPaymentGateway,
        private readonly stripeAccountRepository: IStripeAccountRepository
    ) { }

    async execute(input: GetStripeAccountStatusInput): Promise<GetStripeAccountStatusOutput> {
        try {
            const { accountId } = input;
            if (!accountId) {
                throw new BadRequestError();
            }
            console.log("accountId : ",accountId);
            const stripeAccount = await this.stripeAccountRepository.findByStripeAccountId({stripeAccountId: accountId});
            console.log("stripeAccount : ",stripeAccount);
            if (stripeAccount && stripeAccount.stripeAccountStatus === StripeAccountStatus.PENDING) {
                const account = await this.paymentGateway.getStripeAccount(accountId);
                console.log("account : ",account);
                let accountStatus: StripeAccountStatus = StripeAccountStatus.PENDING;
                if (!account.details_submitted) {
                    accountStatus = StripeAccountStatus.PENDING;
                } else if (!account.charges_enabled) {
                    accountStatus = StripeAccountStatus.RESTRICTED;
                } else if (account.charges_enabled && account.payouts_enabled) {
                    accountStatus = StripeAccountStatus.ACTIVE;
                }

                console.log("accountStatus : ",accountStatus);

                return {
                    accountStatus
                };
            }

            console.log("stripeAccount?.stripeAccountStatus : ",stripeAccount?.stripeAccountStatus);
            return {
                accountStatus: stripeAccount?.stripeAccountStatus || StripeAccountStatus.PENDING
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get stripe account status")
        }
    }
}