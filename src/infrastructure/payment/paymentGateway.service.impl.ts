import Stripe from "stripe";
import { log } from "../../shared/logger/logger";
import { serviceConfig } from "../../config/env";
import { ERROR_CODES } from "../../shared/utils/types/enums";
import { AppError, NotFoundError } from "../../shared/error/appError";
import { IPaymentGateway } from "../../application/interfaces/payment/IPaymentGateway.service";
import {
  CreateSubscriptionCheckoutSessionInput,
  CreateSubscriptionCheckoutSessionOutput,
  CreateBookingCheckoutSessionInput,
  CreateBookingCheckoutSessionOutput,
  CreateStripeCustomerInput,
  CreateStripeCustomerOutput,
  CreateRefundInput,
  CreateRefundOutput,
  RetrievePaymentIntentInput,
  RetrievePaymentIntentOutput,
  RetrieveBalanceInput,
  RetrieveBalanceOutput,
  CreateStripeAccountInput,
  CreateStripeAccountout,
  CreateStripeAccountLinkInput,
  CreateStripeAccountLinkOutput,
} from "../../application/dtos/payment.dtos";

export class PaymentGateway implements IPaymentGateway {
  constructor(private readonly stripe: Stripe) {}

  async createSubscriptionCheckoutSession(
    payload: CreateSubscriptionCheckoutSessionInput,
  ): Promise<CreateSubscriptionCheckoutSessionOutput> {
    try {
      const metadataPayload = {
        userName: payload.userName,
        userEmail: payload.userEmail,
        billingCycle: payload.billingCycle,
        isTrial: String(payload.isTrial),
        subscriptionId: payload.subscriptionId,
        userId: payload.userId,
        paymentFor: payload.paymentFor,
      };

      const session = await this.stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "link"],
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
        // for checkout session events
        metadata: metadataPayload,
        subscription_data: {
          trial_period_days: payload.alreadyUsedTrial ? undefined : payload.trialPeriodDays,
          trial_settings: {
            end_behavior: {
              missing_payment_method: "pause",
            },
          },
          // for invoice / subscription
          metadata: metadataPayload,
        },
        payment_method_collection: "always",
        expires_at: Math.floor(Date.now() / 1000) + 1800,
        billing_address_collection: "required",
        saved_payment_method_options: {
          payment_method_save: "enabled",
        },
      });

      return {
        sessionId: session.id,
      };
    } catch (error: unknown) {
      log.error("PaymentGateway createSubscriptionCheckoutSession failed : ", { error });
      throw new AppError(
        "Failed to initiate subscription checkout",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR,
      );
    }
  }

  async createBookingCheckoutSession(
    payload: CreateBookingCheckoutSessionInput,
  ): Promise<CreateBookingCheckoutSessionOutput> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card", "link"],
        customer: payload.stripeCustomerId,
        payment_intent_data: {
          receipt_email: payload.userEmail,
          metadata: {
            providerId: payload.providerId,
            bookingId: payload.bookingId,
            userId: payload.userId,
            paymentFor: payload.paymentFor,
            userEmail: payload.userEmail,
            userName: payload.userName,
          },
        },
        customer_update: {
          address: "auto",
          name: "auto",
        },
        saved_payment_method_options: {
          payment_method_save: "enabled",
        },
        expires_at: Math.floor(Date.now() / 1000) + 1800,
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
        // for Invoice object
        invoice_creation: {
          enabled: true,
          invoice_data: {
            metadata: {
              providerId: payload.providerId,
              bookingId: payload.bookingId,
              userId: payload.userId,
              paymentFor: payload.paymentFor,
              userEmail: payload.userEmail,
              userName: payload.userName,
            },
          },
        },
        // for checkout
        metadata: {
          providerId: payload.providerId,
          bookingId: payload.bookingId,
          userId: payload.userId,
          paymentFor: payload.paymentFor,
          userEmail: payload.userEmail,
          userName: payload.userName,
        },
      });
      return { sessionId: session.id };
    } catch (error: unknown) {
      log.error("PaymentGateway createBookingCheckoutSession failed : ", { error });
      throw new AppError(
        "Failed to initiate booking checkout",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR,
      );
    }
  }

  async createStripeCustomer(
    payload: CreateStripeCustomerInput,
  ): Promise<CreateStripeCustomerOutput> {
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
      log.error("PaymentGateway createStripeCustomer failed : ", { error });
      throw new AppError(
        "Failed to create stripe customer",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR,
      );
    }
  }

  async retrievePaymentIntent(
    input: RetrievePaymentIntentInput,
  ): Promise<RetrievePaymentIntentOutput> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(input.paymentIntent, {
        expand: ["latest_charge", "latest_charge.balance_transaction"],
      });
      return { paymentIntent };
    } catch (error: unknown) {
      log.error("PaymentGateway retrievePaymentIntent failed : ", { error });
      throw new AppError(
        "Failed to retrieve payment intent",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR,
      );
    }
  }

  async createRefund(input: CreateRefundInput): Promise<CreateRefundOutput> {
    try {
      const refund = await this.stripe.refunds.create(
        {
          payment_intent: input.paymentIntent,
          amount: Math.round(input.refundAmount * 100),
          reason: input.reason,
          metadata: input.metadata,
        },
        {
          stripeAccount: input.stripeAccount,
        },
      );

      return { refundId: refund.id };
    } catch (error: unknown) {
      log.error("PaymentGateway createRefund failed : ", { error });
      throw new AppError("Failed to create refund", 500, false, ERROR_CODES.INTERNAL_ERROR);
    }
  }

  async retrieveBalance(input: RetrieveBalanceInput): Promise<RetrieveBalanceOutput> {
    try {
      const balanceTransaction = await this.stripe.balanceTransactions.retrieve(
        input.balanceTransaction,
      );
      return { balanceTransaction };
    } catch (error: unknown) {
      log.error("PaymentGateway retrieveBalance failed : ", { error });
      throw new AppError(
        "Failed to retrieve balance transaction",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR,
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
      log.error("PaymentGateway createStripeAccount failed : ", { error });
      throw new AppError("Failed to create stripe account", 500, false, ERROR_CODES.INTERNAL_ERROR);
    }
  }

  async createStripeAccountLink(
    input: CreateStripeAccountLinkInput,
  ): Promise<CreateStripeAccountLinkOutput> {
    try {
      const accountLinkData = await this.stripe.accountLinks.create({
        account: input.accountId,
        refresh_url:
          serviceConfig.frontendUrl +
          "/settings/integrations/callback?stripeOnboardingStatus=failed",
        return_url:
          serviceConfig.frontendUrl +
          "/settings/integrations/callback?stripeOnboardingStatus=success",
        type: "account_onboarding",
      });
      return { accountLinkData };
    } catch (error: unknown) {
      log.error("PaymentGateway createStripeAccountLink failed : ", { error });
      throw new AppError(
        "Failed to create stripe account link",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR,
      );
    }
  }

  async findCustomerByUserId(userId: string) {
    const customers = await this.stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
    });

    if (customers.data.length > 0) {
      return {
        customerId: customers.data[0].id,
      };
    }

    return null;
  }

  async getStripeAccount(accountId: string): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return account;
    } catch (error: unknown) {
      log.error("PaymentGateway getStripeAccount failed : ", { error });
      throw new AppError(
        "Failed to retrieve stripe account",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR,
      );
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      if (!subscriptionId) {
        throw new AppError("Subscription ID is required", 400, false, ERROR_CODES.INVALID_REQUEST);
      }

      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error: unknown) {
      log.error("PaymentGateway getSubscription failed: ", { error });
      throw new AppError(
        "Failed to retrieve subscription details",
        500,
        false,
        ERROR_CODES.INTERNAL_ERROR,
      );
    }
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      if (!invoiceId) {
        throw new AppError("Invoice ID is required", 400, false, ERROR_CODES.INVALID_REQUEST);
      }

      const invoice = await this.stripe.invoices.retrieve(invoiceId, {
        expand: ["payment_intent", "payment_intent.latest_charge", "charge"],
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
        ERROR_CODES.PAYMENT_SERVICE_ERROR,
      );
    }
  }
}
