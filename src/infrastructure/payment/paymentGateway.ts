import Stripe from "stripe";
import { log } from "../../shared/logger/logger";
import { IPaymentGateway, CreateSubscriptionCheckoutSessionPayload, CreateSubscriptionCheckoutSessionResponse, CreateBookingCheckoutSessionPayload, CreateBookingCheckoutSessionResponse } from "../../domain/interfaces/payment/IPaymentGateway";

export class PaymentGateway implements IPaymentGateway {

    constructor(
        private readonly stripe: Stripe
    ) { };

    async createSubscriptionCheckoutSession(payload: CreateSubscriptionCheckoutSessionPayload): Promise<CreateSubscriptionCheckoutSessionResponse> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
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
                    planDuration: payload.planDuration,
                    paymentFor: payload.paymentFor,
                    name: payload.name,
                    email: payload.email,
                    initialAmount: payload.initialAmount,
                },
            });

            return { sessionId: session.id };
        } catch (error) {
            log.error("PaymentGateway createSubscriptionCheckoutSession failed : ", error as Error);
            throw error;
        }
    };

    async createBookingCheckoutSession(payload: CreateBookingCheckoutSessionPayload): Promise<CreateBookingCheckoutSessionResponse> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
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
                    slotDuration: payload.slotDuration,
                    selectedServiceMode: payload.selectedServiceMode,
                    bookingId: payload.bookingId,
                    userId: payload.userId,
                    paymentFor: payload.paymentFor,
                    userEmail: payload.userEmail,
                    userName: payload.userName,
                    initialAmount: payload.initialAmount,
                    pushNotification: payload.pushNotification
                },
            });
            return { sessionId: session.id }
        } catch (error) {
            log.error("PaymentGateway createBookingCheckoutSession failed : ", error as Error);
            throw error;
        }
    }
};
