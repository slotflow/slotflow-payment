import { StripeAccountProps } from "../contracts/stripeAccount";

export type CreateStripeAccountProps = Pick<StripeAccountProps, "stripeAccountId" | "stripeCustomerId" | "stripeAccountStatus" | "userId">