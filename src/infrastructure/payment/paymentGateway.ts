import Stripe from "stripe";
import { IPaymentGateway, SubscriptionCreateCheckoutSessionPayload, SubscriptionCreateCheckoutSessionResult } from "../../domain/interfaces/payment/IPaymentGateway";
import { log } from "../../shared/logger/logger";

export class PaymentGateway implements IPaymentGateway {

    constructor(
        private readonly stripe: Stripe
    ) { };

    async subscriptionCreateCheckoutSession(payload: SubscriptionCreateCheckoutSessionPayload): Promise<SubscriptionCreateCheckoutSessionResult> {
        try {
            console.log("subscriptionCreateCheckoutSession");
            console.log("payload : ", payload);
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
                    paymentDate: payload.paymentDate,
                    name: payload.name,
                    email: payload.email,
                    initialAmount: payload.initialAmount,
                },
            });

            return { sessionId: session.id };
        } catch (error) {
            log.error("PaymentGateway subscriptionCreateCheckoutSession failed : ", error as Error);
            throw error;
        }
    };
};
