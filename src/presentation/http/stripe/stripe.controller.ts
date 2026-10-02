import Stripe from "stripe";
import { Request, Response } from "express";
import { stripeConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { paymentFailedMapper } from "../../../infrastructure/helper";
import { stripeClient } from "../../../infrastructure/payment/stripe.client";
import { IPaymentFailedMapper } from "../../../application/interfaces/helper/IPaymentMapper.helper";
import { StripeAccountRevokedUseCase } from "../../../application/useCases/stripe/stripeAccountRevoked.useCase";
import { BookingPaymentFailedUseCase } from "../../../application/useCases/payment/booking/bookingPaymentFailed.useCase";
import { UpdateStripeAccountStatusUseCase } from "../../../application/useCases/stripe/updateStripeAccountStatus.useCase";
import { SubscriptionPaymentFailedUseCase } from "../../../application/useCases/payment/subscription/subscriptionPaymentFailed.useCase";
import { BookingInvoicePaymentSucceededUseCase } from "../../../application/useCases/payment/booking/bookingInvoicePaymentSucceeded.useCase";
import { SubscriptionInvoicePaymentSucceededUseCase } from "../../../application/useCases/payment/subscription/subscriptionInvoicePaymentSucceeded.useCase";
import { bookingInvoicePaymentSucceededUseCase, bookingPaymentFailedUseCase, stripeAccountRevokedUseCase, subscriptionInvoicePaymentSucceededUseCase, subscriptionPaymentFailedUseCase, updateStripeAccountStatusUseCase } from '.';

class StripeWebhookController {
    constructor(
        private readonly subscriptionInvoicePaymentSucceededUseCase: SubscriptionInvoicePaymentSucceededUseCase,
        private readonly bookingInvoicePaymentSucceededUseCase: BookingInvoicePaymentSucceededUseCase,
        private readonly updateStripeAccountStatusUseCase: UpdateStripeAccountStatusUseCase,
        private readonly stripeAccountRevokedUseCase: StripeAccountRevokedUseCase,
        private readonly paymentFailedMapper: IPaymentFailedMapper,
        private readonly bookingPaymentFailedUseCase: BookingPaymentFailedUseCase,
        private readonly subscriptionPaymentFailedUseCase: SubscriptionPaymentFailedUseCase,
    ) {
        this.handleStripeWebhook = this.handleStripeWebhook.bind(this);
    };

    async handleStripeWebhook(req: Request, res: Response) {
        let event: Stripe.Event;

        try {
            const sig = req.headers["stripe-signature"]!;

            event = stripeClient.webhooks.constructEvent(
                req.body,
                sig,
                stripeConfig.stripeWebhookSecret
            );
        } catch (error) {
            log.error("Stripe webhook signature verification failed: ", error as Error);
            return res.status(400).send(`Webhook Error: ${(error as Error).message}`);
        }

        res.json({ received: true });

        try {
            switch (event.type) {

                case "invoice.payment_succeeded": {
                    log.info(`Handled event type: ${event.type}`);
                    const invoice = event.data.object as Stripe.Invoice;
                    const metadata = invoice?.parent?.subscription_details?.metadata || invoice?.metadata;
                    const paymentFor = metadata?.paymentFor;

                    console.log("metadata : ",metadata);

                    if (paymentFor === PaymentFor.PROVIDER_SUBSCRIPTION) {
                        await this.subscriptionInvoicePaymentSucceededUseCase.execute(invoice);
                    } else if (paymentFor === PaymentFor.APPOINTMENT_BOOKING) {
                        await this.bookingInvoicePaymentSucceededUseCase.execute(invoice);
                    }
                    break;
                }

                case "invoice.payment_failed": {
                    log.info(`Handled event type: ${event.type}`);
                    const invoice = event.data.object as Stripe.Invoice;
                    if (!invoice) break;
                    console.log("invoice : ", invoice);

                    const metadata = invoice.metadata;
                    console.log("metadata : ", metadata);

                    const payment = await this.paymentFailedMapper.fromInvoicePaymentFailed(invoice);
                    if (!payment) break;
                    console.log("payment : ", payment);

                    const subscriptionId = metadata?.subscriptionId;
                    const bookingId = metadata?.bookingId;

                    if (subscriptionId) {
                        await this.subscriptionPaymentFailedUseCase.execute({
                            payment,
                            subscriptionId
                        })
                    }

                    if (bookingId) {
                        await this.bookingPaymentFailedUseCase.execute({
                            payment,
                            bookingId
                        })
                    }
                    break;
                }

                case 'payment_intent.payment_failed': {
                    log.info(`Handled event type: ${event.type}`);
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    if (!paymentIntent) break;
                    console.log("paymentIntent : ", paymentIntent);

                    const metadata = paymentIntent.metadata;
                    console.log("metadata : ", metadata);

                    const payment = this.paymentFailedMapper.fromPaymentIntentFailed(paymentIntent);
                    if (!payment) break;

                    const subscriptionId = metadata.subscriptionId;
                    const bookingId = metadata.bookingId;

                    if (subscriptionId) {
                        await this.subscriptionPaymentFailedUseCase.execute({
                            payment,
                            subscriptionId
                        })
                    }

                    if (bookingId) {
                        await this.bookingPaymentFailedUseCase.execute({
                            payment,
                            bookingId
                        })
                    }
                    break;
                }

                case 'checkout.session.expired': {
                    log.info(`Handled event type: ${event.type}`);

                    const session = event.data.object as Stripe.Checkout.Session;
                    if (!session) break;
                    console.log("session : ", session);

                    const metadata = session.metadata;
                    console.log("metadata : ", metadata);

                    const payment = this.paymentFailedMapper.fromCheckoutSessionExpired(session);
                    if (!payment) break;
                    console.log("payment : ", payment);

                    const bookingId = metadata?.bookingId;
                    const subscriptionId = metadata?.subscriptionId;

                    if (subscriptionId) {
                        await this.subscriptionPaymentFailedUseCase.execute({
                            payment,
                            subscriptionId
                        })
                    };

                    if (bookingId) {
                        await this.bookingPaymentFailedUseCase.execute({
                            payment,
                            bookingId
                        })
                    };

                    break;
                }

                case "account.updated": {
                    const account = event.data.object as Stripe.Account
                    await this.updateStripeAccountStatusUseCase.execute({
                        account
                    });
                    break;
                }

                case "account.application.deauthorized": {
                    const data = event.data.object as Stripe.Application;
                    await this.stripeAccountRevokedUseCase.execute({
                        accountId: data.id,
                    });
                    break;
                }

                case "customer.subscription.updated": {
                    const subscription = event.data.object as Stripe.Subscription;
                    break;
                }

                case "customer.subscription.deleted": {
                    const subscription = event.data.object as Stripe.Subscription;
                    break;
                }

                /**
                 * Optional for the payment saving // can be used as fallback of invoice.payment_succeeded 
                 * */

                // case "checkout.session.completed": {
                //     log.info(`Handled event type: ${event.type}`);
                //     const session = event.data.object as Stripe.Checkout.Session;
                //     const paymentFor = session.metadata?.paymentFor;

                //     if (paymentFor === PaymentFor.PROVIDER_SUBSCRIPTION) {
                //         console.log("one")
                //         await this.subscriptionCheckoutCompleteUseCase.execute(session);
                //     } else if (paymentFor === PaymentFor.APPOINTMENT_BOOKING) {
                //         await this.bookingCheckoutCompleteUseCase.execute(session);
                //     }
                //     break;
                // }

                default:
                    log.info(`Unhandled event type: ${event.type}`);
                    break;
            }
        } catch (error) {
            log.error(`handleStripeWebhook failed processing [${event.type}]: `, error as Error);
        }
    };
};

export const stripeWebhookController = new StripeWebhookController(
    subscriptionInvoicePaymentSucceededUseCase,
    bookingInvoicePaymentSucceededUseCase,
    updateStripeAccountStatusUseCase,
    stripeAccountRevokedUseCase,
    paymentFailedMapper,
    bookingPaymentFailedUseCase,
    subscriptionPaymentFailedUseCase
);