import Stripe from "stripe";
import { log } from "../../shared/logger/logger";
import { ERROR_CODES } from "../../shared/utils/type";
import { AppError } from "../../shared/error/appError";
import { IPaymentGateway, CreateSubscriptionCheckoutSessionPayload, CreateSubscriptionCheckoutSessionResponse, CreateBookingCheckoutSessionPayload, CreateBookingCheckoutSessionResponse, CreateStripeCustomerPayload, CreateStripeCustomerResponse, CreateRefundInput, CreateRefundOutput, RetrievePaymentIntentInput, RetrievePaymentIntentOutput, RetrieveBalanceInput, RetrieveBalanceOutput, CreateStripeAccountInput, CreateStripeAccountout, CreateStripeAccountLinkInput, CreateStripeAccountLinkOutput } from "../../domain/interfaces/payment/IPaymentGateway";
import { serviceConfig } from "../../config/env";

export class PaymentGateway implements IPaymentGateway {

    constructor(
        private readonly stripe: Stripe
    ) { };

    async createSubscriptionCheckoutSession(payload: CreateSubscriptionCheckoutSessionPayload): Promise<CreateSubscriptionCheckoutSessionResponse> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                customer: payload.stripeCustomerId,
                customer_email: payload.email,
                allow_promotion_codes: true,
                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: payload.planName,
                                description: payload.description,
                            },
                            unit_amount: payload.unitAmount * 100,
                        },
                        quantity: payload.planDuration,
                    },
                ],
                success_url: payload.successUrl,
                cancel_url: payload.cancelUrl,
                metadata: {
                    subscriptionId: payload.subscriptionId,
                    providerId: payload.providerId,
                    planDuration: payload.planDuration.toString(),
                    paymentFor: payload.paymentFor,
                    name: payload.name,
                    email: payload.email,
                    initialAmount: payload.initialAmount.toString(),
                },
            });

            return { sessionId: session.id };
        } catch (error: unknown) {
            log.error("PaymentGateway createSubscriptionCheckoutSession failed : ", error as Error);
            throw new AppError(
                "Failed to initiate subscription checkout",
                500,
                false,
                ERROR_CODES.CHECKOUT_ERROR
            );
        }
    };

    async createBookingCheckoutSession(payload: CreateBookingCheckoutSessionPayload): Promise<CreateBookingCheckoutSessionResponse> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                customer: payload.stripeCustomerId,
                customer_email: payload.userEmail,
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
                    initialAmount: payload.initialAmount.toString(),
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
                ERROR_CODES.CHECKOUT_ERROR
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
                ERROR_CODES.STRIPE_CREATE_CUSTOMER_ERROR
            );
        }
    }

    async retrievePaymentIntent(input: RetrievePaymentIntentInput): Promise<RetrievePaymentIntentOutput> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(
                input.paymentIntent,
                {
                    expand: ['latest_charge']
                }
            );
            return { paymentIntent };
        } catch (error: unknown) {
            log.error("PaymentGateway retrievePaymentIntent failed : ", error as Error);
            throw new AppError(
                "Failed to retrieve payment intent",
                500,
                false,
                ERROR_CODES.STRIPE_RETRIEVE_ERROR
            );
        }
    }

    async createRefund(input: CreateRefundInput): Promise<CreateRefundOutput> {
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
                ERROR_CODES.STRIPE_REFUND_ERROR
            )
        }
    }

    async retrieveBalance(input: RetrieveBalanceInput): Promise<RetrieveBalanceOutput> {
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
                ERROR_CODES.STRIPE_RETRIEVE_ERROR
            );
        }
    }

    async createStripeAccount(input: CreateStripeAccountInput): Promise<CreateStripeAccountout> {
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
                ERROR_CODES.STRIPE_CREATE_ACCOUNT_ERROR
            );
        }
    }

    async createStripeAccountLink(input: CreateStripeAccountLinkInput): Promise<CreateStripeAccountLinkOutput> {
        try {
            const accountLink = await this.stripe.accountLinks.create({
                account: input.accountId,
                refresh_url: serviceConfig.frontendUrl+"/stripe/refresh",
                return_url: serviceConfig.frontendUrl+"/stripe/success",
                type: "account_onboarding",
            });
            return { accountLink }
        } catch (error: unknown) {
            log.error("PaymentGateway createStripeAccountLink failed : ", error as Error);
            throw new AppError(
                "Failed to create stripe account link",
                500,
                false,
                ERROR_CODES.STRIPE_CREATE_ACCOUNT_LINK_ERROR
            );
        }
    }
};
