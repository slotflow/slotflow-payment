import Stripe from "stripe";
import { Role } from "../../domain/enums/common.enum";
import { StripeAccountStatus } from "../../domain/enums/payment.enum";

// createStripeCustomer usecase input output
export interface CreateStripeCustomerInput {
    username: string;
    email: string;
    userId: string;
    role: Role;
}
export interface CreateStripeCustomerOutput {
    stripeCustomerId: string;
}

// StripeAccountLink usecase input output
export interface StripeAccountLinkInput {
  userId: string;
  email: string;
};
export type StripeAccountLinkOutput = {
  accountLink: Stripe.Response<Stripe.AccountLink>;
  accountId: string;
}

// GetStripeAccountStatus usecase input output
export interface GetStripeAccountStatusInput {
  accountId: string;
  userId: string;
}
export type GetStripeAccountStatusOutput = {
  accountStatus: StripeAccountStatus;
}