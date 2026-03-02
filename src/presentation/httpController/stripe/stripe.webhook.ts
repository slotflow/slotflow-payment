import Stripe from "stripe";
import { Request, Response } from "express";
import { stripeConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { stripe } from "../../../infrastructure/lib/stripe";
import { subscriptionCheckoutCompleteUseCase } from '.';
import { SubscriptionCheckoutCompleteUseCase } from "../../../application/useCases/payment/subscriptionCheckoutCompleted";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { bookingCheckoutCompleteUseCase } from ".";
import { BookingCheckoutCompleteUseCase } from "../../../application/useCases/payment/bookingCheckoutComplete";

class StripeWebhookController {
    constructor(
        private readonly subscriptionCheckoutCompleteUseCase: SubscriptionCheckoutCompleteUseCase,
        private readonly bookingCheckoutCompleteUseCase: BookingCheckoutCompleteUseCase
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
                const session = event.data.object as Stripe.Checkout.Session;
                const paymentFor = session.metadata?.paymentFor;
                if (paymentFor === PaymentFor.PROVIDER_SUBSCRIPTION) {
                    await this.subscriptionCheckoutCompleteUseCase.execute(
                        event.data.object as Stripe.Checkout.Session
                    );
                } else if (paymentFor === PaymentFor.APPOINTMENT_BOOKING) {
                    await this.bookingCheckoutCompleteUseCase.execute(
                        event.data.object as Stripe.Checkout.Session
                    );
                }
            };
        } catch (error) {
            log.error("handleStripeWebhook failed : ", error as Error);
        }
    };
};

export const stripeWebhookController = new StripeWebhookController(
    subscriptionCheckoutCompleteUseCase,
    bookingCheckoutCompleteUseCase
);