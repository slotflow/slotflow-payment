import Stripe from "stripe";
import { log } from "../../shared/logger/logger";
import { serviceConfig } from "../../config/env";
import { ERROR_CODES } from "../../shared/utils/types";
import { AppError, NotFoundError } from "../../shared/error/appError";
import { IPaymentGateway, CreateSubscriptionCheckoutSessionPayload, CreateSubscriptionCheckoutSessionResponse, CreateBookingCheckoutSessionPayload, CreateBookingCheckoutSessionResponse, CreateStripeCustomerPayload, CreateStripeCustomerResponse, CreateRefundPayload, CreateRefundOutput, RetrievePaymentIntentPayload, RetrievePaymentIntentOutput, RetrieveBalancePayload, RetrieveBalanceOutput, CreateStripeAccountPayload, CreateStripeAccountout, CreateStripeAccountLinkPayload, CreateStripeAccountLinkOutput } from "../../domain/interfaces/payment/IPaymentGateway";

export class PaymentGateway implements IPaymentGateway {

    constructor(
        private readonly stripe: Stripe
    ) { };

    async createSubscriptionCheckoutSession(payload: CreateSubscriptionCheckoutSessionPayload): Promise<CreateSubscriptionCheckoutSessionResponse> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: "subscription",
                payment_method_types: ['card', 'link'],
                customer: payload.stripeCustomerId,
                customer_update: {
                    address: "auto",
                    name: "auto",
                },
                line_items: [
                    {
                        price: payload.priceId,
                        quantity: 1,
                    },
                ],
                success_url: payload.successUrl,
                cancel_url: payload.cancelUrl,
                metadata: {
                    planName: payload.planName,
                    userName: payload.userName,
                    userEmail: payload.userEmail,
                    billingCycle: payload.billingCycle,
                    subscriptionId: payload.subscriptionId,
                    userId: payload.userId,
                    paymentFor: payload.paymentFor,
                    isTrial: String(payload.isTrial)
                },
                subscription_data: {
                    trial_period_days: payload.alreadyUsedTrial ? undefined : payload.trialPeriodDays,
                    trial_settings: {
                        end_behavior: {
                            missing_payment_method: "pause",
                        },
                    },
                    metadata: {
                        subscriptionId: payload.subscriptionId,
                        userId: payload.userId,
                        paymentFor: payload.paymentFor,
                    },
                },
                payment_method_collection: "always",
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                billing_address_collection: "required",
                saved_payment_method_options: {
                    payment_method_save: "enabled",
                },
            });

            return {
                sessionId: session.id,
            };
        } catch (error: unknown) {
            log.error("PaymentGateway createSubscriptionCheckoutSession failed : ", error as Error);
            throw new AppError(
                "Failed to initiate subscription checkout",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    };

    async createBookingCheckoutSession(payload: CreateBookingCheckoutSessionPayload): Promise<CreateBookingCheckoutSessionResponse> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ['card', 'link'],
                customer: payload.stripeCustomerId,
                allow_promotion_codes: true,
                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: payload.serviceName,
                                description: payload.description,
                            },
                            unit_amount: payload.unitAmount * 100,
                        },
                        quantity: 1,
                    },
                ],
                success_url: payload.successUrl,
                cancel_url: payload.cancelUrl,
                metadata: {
                    providerId: payload.providerId,
                    slotDuration: payload.slotDuration.toString(),
                    selectedServiceMode: payload.selectedServiceMode,
                    bookingId: payload.bookingId,
                    userId: payload.userId,
                    paymentFor: payload.paymentFor,
                    userEmail: payload.userEmail,
                    userName: payload.userName,
                    pushNotification: payload.pushNotification
                },
            });
            return { sessionId: session.id }
        } catch (error: unknown) {
            log.error("PaymentGateway createBookingCheckoutSession failed : ", error as Error);
            throw new AppError(
                "Failed to initiate booking checkout",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    }

    async createStripeCustomer(payload: CreateStripeCustomerPayload): Promise<CreateStripeCustomerResponse> {
        try {
            const customer = await this.stripe.customers.create({
                email: payload.email,
                name: payload.name,
                metadata: {
                    userId: payload.userId,
                    role: payload.role,
                },
            });
            return { customerId: customer.id };
        } catch (error: unknown) {
            log.error("PaymentGateway createStripeCustomer failed : ", error as Error);
            throw new AppError(
                "Failed to create stripe customer",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    }

    async retrievePaymentIntent(input: RetrievePaymentIntentPayload): Promise<RetrievePaymentIntentOutput> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(
                input.paymentIntent,
                {
                    expand: ['latest_charge', 'latest_charge.balance_transaction']
                }
            );
            return { paymentIntent };
        } catch (error: unknown) {
            log.error("PaymentGateway retrievePaymentIntent failed : ", error as Error);
            throw new AppError(
                "Failed to retrieve payment intent",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    }

    async createRefund(input: CreateRefundPayload): Promise<CreateRefundOutput> {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: input.paymentIntent,
                amount: Math.round(input.refundAmount * 100),
                reason: input.reason,
                metadata: input.metadata,
            }, {
                stripeAccount: input.stripeAccount
            });

            return { refundId: refund.id };
        } catch (error: unknown) {
            log.error("PaymentGateway createRefund failed : ", error as Error);
            throw new AppError(
                "Failed to create refund",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            )
        }
    }

    async retrieveBalance(input: RetrieveBalancePayload): Promise<RetrieveBalanceOutput> {
        try {
            const balanceTransaction = await this.stripe.balanceTransactions.retrieve(
                input.balanceTransaction
            );
            return { balanceTransaction };
        } catch (error: unknown) {
            log.error("PaymentGateway retrieveBalance failed : ", error as Error);
            throw new AppError(
                "Failed to retrieve balance transaction",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    }

    async createStripeAccount(input: CreateStripeAccountPayload): Promise<CreateStripeAccountout> {
        try {
            const account = await this.stripe.accounts.create({
                type: "express",
                email: input.email,
            });
            return { account };
        } catch (error: unknown) {
            log.error("PaymentGateway createStripeAccount failed : ", error as Error);
            throw new AppError(
                "Failed to create stripe account",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    }

    async createStripeAccountLink(input: CreateStripeAccountLinkPayload): Promise<CreateStripeAccountLinkOutput> {
        try {
            const accountLinkData = await this.stripe.accountLinks.create({
                account: input.accountId,
                refresh_url: serviceConfig.frontendUrl + "/provider/settings/integrations?stripeOnboardingStatus=failed",
                return_url: serviceConfig.frontendUrl + "/provider/settings/integrations?stripeOnboardingStatus=success",
                type: "account_onboarding",
            });
            return { accountLinkData }
        } catch (error: unknown) {
            log.error("PaymentGateway createStripeAccountLink failed : ", error as Error);
            throw new AppError(
                "Failed to create stripe account link",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    }

    async findCustomerByUserId(userId: string) {
        const customers = await this.stripe.customers.search({
            query: `metadata['userId']:'${userId}'`
        });

        if (customers.data.length > 0) {
            return {
                customerId: customers.data[0].id
            };
        }

        return null;
    }

    async getStripeAccount(accountId: string): Promise<Stripe.Account> {
        try {
            const account = await this.stripe.accounts.retrieve(accountId);
            return account;
        } catch (error: unknown) {
            log.error("PaymentGateway getStripeAccount failed : ", error as Error);
            throw new AppError(
                "Failed to retrieve stripe account",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    }

    async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        try {
            if (!subscriptionId) {
                throw new AppError(
                    "Subscription ID is required",
                    400,
                    false,
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            return subscription;
        } catch (error: unknown) {
            log.error("PaymentGateway getSubscription failed: ", error as Error);
            throw new AppError(
                "Failed to retrieve subscription details",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    }

    async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
        try {
            if (!invoiceId) {
                throw new AppError(
                    "Invoice ID is required",
                    400,
                    false,
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            const invoice = await this.stripe.invoices.retrieve(invoiceId, {
                expand: ["payment_intent", 'payment_intent.latest_charge', 'charge'],
            });

            if (!invoice) {
                throw new NotFoundError("Stripe invoice not found");
            }

            return invoice;
        } catch (error: unknown) {
            if (error instanceof AppError) {
                throw error;
            }

            const stripeError = error as Stripe.errors.StripeError;
            throw new AppError(
                stripeError.message || "Failed to retrieve Stripe invoice",
                stripeError.statusCode || 500,
                false,
                ERROR_CODES.PAYMENT_SERVICE_ERROR
            );
        }
    }
};
