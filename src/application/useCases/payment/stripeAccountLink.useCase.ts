import { log } from "../../../shared/logger/logger";
import { stripe } from "../../../infrastructure/lib/stripe";
import { StripeAccountLinkRequest, StripeAccountLinkResponse } from "../../dtos/payment.dtos";

export class StripeAccountLinkUseCase {
    constructor(
    ) { };

    async execute(payload: StripeAccountLinkRequest): Promise<StripeAccountLinkResponse> {
        try {

            const { email } = payload

                const account = await stripe.accounts.create({
                    type: "express",
                    email: email,
                });
                if (!account) throw new Error("Stripe connecting failed");
                // provider.linkStripeAccount(account.id);
                // TODO need to send kafka event to main backend to update the providerOr User with stripe account id
             
            const accountLink = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${process.env.FRONTEND_URL}/provider/stripe/refresh`,
                return_url: `${process.env.FRONTEND_URL}/provider/stripe/success`,
                type: "account_onboarding",
            });

            console.log("accountLink : ", accountLink);

            return accountLink;
        } catch (error) {
            log.error("StripeAccountLinkUseCase failed", error as Error);
            throw error;
        };
    };
};