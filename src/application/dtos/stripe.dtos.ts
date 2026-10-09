import Stripe from "stripe";
import { Role } from "../../domain/enums/common.enum";
import { PaymentAccountStatus } from "../../domain/enums/payment.enum";

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
}
export interface StripeAccountLinkOutput {
  boardingUrl: string;
}

// GetStripeAccountStatus usecase input output
export interface GetStripeAccountStatusInput {
  userId: string;
}
export type GetStripeAccountStatusOutput = {
  stripeStatus: PaymentAccountStatus;
};

// UpdateAccountStatus usecase input
export interface UpdateStripeAccountStatusInput {
  account: Stripe.Account;
}

// StripeAccountRevoked usecase input
export interface StripeAccountRevokedInput {
  accountId: string;
}
