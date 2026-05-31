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
export interface StripeAccountLinkOutput {
  accountLink: string;
  accountId: string;
}

// GetStripeAccountStatus usecase input output
export interface GetStripeAccountStatusInput {
  accountId: string;
}
export type GetStripeAccountStatusOutput = {
  accountStatus: StripeAccountStatus;
}

// UpdateAccountStatus usecase input
export interface UpdateStripeAccountStatusInput {
  account: Stripe.Account;
}

// StripeAccountRevoked usecase input
export interface StripeAccountRevokedInput {
  accountId: string;
}