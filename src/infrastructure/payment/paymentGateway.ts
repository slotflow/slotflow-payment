import Stripe from "stripe";
import { IPaymentGateway, SubscriptionCreateCheckoutSessionPayload, SubscriptionCreateCheckoutSessionResult } from "../../domain/interfaces/payment/IPaymentGateway";

export class PaymentGateway implements IPaymentGateway {

    constructor(
        private readonly stripe: Stripe
    ) { };

    async subscriptionCreateCheckoutSession(payload: SubscriptionCreateCheckoutSessionPayload): Promise<SubscriptionCreateCheckoutSessionResult> {
        const session = await this.stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: payload.planName,
                            description: payload.description,
                        },
                        unit_amount: payload.unitAmount * payload.planDuration * 100,
                    },
                    quantity: 1,
                },
            ],
            success_url: payload.successUrl,
            cancel_url: payload.cancelUrl,
            metadata: {
                subscriptionId: payload.subscriptionId,
                providerId: payload.providerId,
                planDuration: payload.planDuration,
                totalAmount: payload.totalAmount,
                paymentFor: payload.paymentFor,
                paymentDate: payload.paymentDate,
                name: payload.name,
                email: payload.email,
                // paymentId: payload.paymentId,
                initialAmount: payload.initialAmount,
                discountAmount: payload.discountAmount,
            },
        });

        return { sessionId: session.id };
    };
};
