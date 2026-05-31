import Stripe from "stripe";
import { Request, Response } from "express";
import { stripeConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { DecodedUser } from "../../../application/dtos/common.dtos";
import { stripe } from "../../../infrastructure/payment/stripe.client";
import { StripeAccountRevokedUseCase } from "../../../application/useCases/stripe/stripeAccountRevoked.useCase";
import { BookingCheckoutCompleteUseCase } from "../../../application/useCases/payment/bookingCheckoutComplete.useCase";
import { UpdateStripeAccountStatusUseCase } from "../../../application/useCases/stripe/updateStripeAccountStatus.useCase";
import { SubscriptionCheckoutCompleteUseCase } from "../../../application/useCases/payment/subscriptionCheckoutCompleted.useCase";
import { bookingCheckoutCompleteUseCase, stripeAccountRevokedUseCase, subscriptionCheckoutCompleteUseCase, updateStripeAccountStatusUseCase } from '.';

class StripeWebhookController {
    constructor(
        private readonly subscriptionCheckoutCompleteUseCase: SubscriptionCheckoutCompleteUseCase,
        private readonly bookingCheckoutCompleteUseCase: BookingCheckoutCompleteUseCase,
        private readonly updateStripeAccountStatusUseCase: UpdateStripeAccountStatusUseCase,
        private readonly stripeAccountRevokedUseCase: StripeAccountRevokedUseCase
    ) {
        this.handleStripeWebhook = this.handleStripeWebhook.bind(this);
    };

    async handleStripeWebhook(req: Request, res: Response) {
        try {
            const sig = req.headers["stripe-signature"]!;

            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                stripeConfig.stripeWebhookSecret
            );

            res.json({ received: true });

            if (event.type === "checkout.session.completed") {
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

            if (event.type === "account.updated") {
                await this.updateStripeAccountStatusUseCase.execute({
                    account: event.data.object as Stripe.Account,
                })
            } else if (event.type === "account.application.deauthorized") {
                const data = event.data.object as Stripe.Application;
                await this.stripeAccountRevokedUseCase.execute({
                    accountId: data.id,
                })
            };
        } catch (error) {
            log.error("handleStripeWebhook failed : ", error as Error);
        }
    };
};

export const stripeWebhookController = new StripeWebhookController(
    subscriptionCheckoutCompleteUseCase,
    bookingCheckoutCompleteUseCase,
    updateStripeAccountStatusUseCase,
    stripeAccountRevokedUseCase
);