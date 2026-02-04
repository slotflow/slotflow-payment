import Stripe from "stripe";
import { Request, Response } from "express";
import { stripe } from "../../../infrastructure/lib/stripe";
import { providerStripeCheckoutCompleteUseCase } from "..";
import { ProviderStripeCheckoutCompleteUseCase } from "../../../application/useCases/providerPayment/providerStripeCheckoutCompleted";

class StripeWebhookController {
    constructor(
        private readonly providerStripeCheckoutCompleteUseCase: ProviderStripeCheckoutCompleteUseCase
    ) {
        this.handleStripeWebhook = this.handleStripeWebhook.bind(this);
    };

    async handleStripeWebhook(req: Request, res: Response) {
        const sig = req.headers["stripe-signature"]!;

        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        if (event.type === "checkout.session.completed") {
            await this.providerStripeCheckoutCompleteUseCase.execute(
                event.data.object as Stripe.Checkout.Session
            );
        };

        res.json({ received: true });
    };
};

export const stripeWebhookController = new StripeWebhookController(
    providerStripeCheckoutCompleteUseCase,
);