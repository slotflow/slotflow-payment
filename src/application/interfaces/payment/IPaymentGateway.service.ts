import Stripe from "stripe";
import {
  CreateBookingCheckoutSessionInput,
  CreateBookingCheckoutSessionOutput,
  CreateRefundOutput,
  CreateRefundInput,
  CreateStripeAccountLinkOutput,
  CreateStripeAccountLinkInput,
  CreateStripeAccountout,
  CreateStripeAccountInput,
  CreateStripeCustomerInput,
  CreateStripeCustomerOutput,
  CreateSubscriptionCheckoutSessionInput,
  CreateSubscriptionCheckoutSessionOutput,
  RetrieveBalanceOutput,
  RetrieveBalanceInput,
  RetrievePaymentIntentOutput,
  RetrievePaymentIntentInput,
} from "../../dtos/payment.dtos";

export interface IPaymentGateway {
  createSubscriptionCheckoutSession(
    input: CreateSubscriptionCheckoutSessionInput,
  ): Promise<CreateSubscriptionCheckoutSessionOutput>;

  createBookingCheckoutSession(
    input: CreateBookingCheckoutSessionInput,
  ): Promise<CreateBookingCheckoutSessionOutput>;

  createStripeCustomer(input: CreateStripeCustomerInput): Promise<CreateStripeCustomerOutput>;

  createRefund(input: CreateRefundInput): Promise<CreateRefundOutput>;

  retrievePaymentIntent(input: RetrievePaymentIntentInput): Promise<RetrievePaymentIntentOutput>;

  retrieveBalance(input: RetrieveBalanceInput): Promise<RetrieveBalanceOutput>;

  createStripeAccount(input: CreateStripeAccountInput): Promise<CreateStripeAccountout>;

  createStripeAccountLink(
    input: CreateStripeAccountLinkInput,
  ): Promise<CreateStripeAccountLinkOutput>;

  findCustomerByUserId(userId: string): Promise<{ customerId: string } | null>;

  getStripeAccount(accountId: string): Promise<Stripe.Account>;

  getSubscription(subscriptionId: string): Promise<Stripe.Subscription>;

  getInvoice(invoiceId: string): Promise<Stripe.Invoice>;
}
