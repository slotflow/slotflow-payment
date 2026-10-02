import Stripe from "stripe";
import { Payment } from "../../../domain/entities/payment.entity";

export interface IPaymentFailedMapper {
    fromPaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Payment;

    fromCheckoutSessionExpired(session: Stripe.Checkout.Session): Payment;

    fromInvoicePaymentFailed(invoice: Stripe.Invoice): Payment;
}