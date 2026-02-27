import Stripe from "stripe";
import { Request, Response } from "express";
import { stripeConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { providerStripeCheckoutCompleteUseCase } from '.';
import { stripe } from "../../../infrastructure/lib/stripe";
import { ProviderStripeCheckoutCompleteUseCase } from "../../../application/useCases/payment/providerStripeCheckoutCompleted";

class StripeWebhookController {
    constructor(
        private readonly providerStripeCheckoutCompleteUseCase: ProviderStripeCheckoutCompleteUseCase
    ) {
        this.handleStripeWebhook = this.handleStripeWebhook.bind(this);
    };

    async handleStripeWebhook(req: Request, res: Response) {
        console.log("webhook")
        const sig = req.headers["stripe-signature"]!;
        console.log("sig : ", sig);

        try {

            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                stripeConfig.stripeWebhookSecret
            );

            res.json({ received: true });
            console.log("event : ", event);
            console.log("event type : ", event.type);

            if (event.type === "checkout.session.completed") {
                console.log("executing the useCase");
                await this.providerStripeCheckoutCompleteUseCase.execute(
                    event.data.object as Stripe.Checkout.Session
                );
            };
        } catch (error) {
            log.error("handleStripeWebhook failed : ", error as Error);
        }
    };
};

export const stripeWebhookController = new StripeWebhookController(
    providerStripeCheckoutCompleteUseCase,
);