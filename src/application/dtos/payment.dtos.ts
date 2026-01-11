import { PaymentDTO } from "./common.dtos";

// **** subscription queries findByProviderId method response payment data fething model

// Used as the response type for fetching subscriptions with planName and plan price of a specific provider for the provider side and admin side
// removing payment dependedcy data from here the data will be requested from payment service from client directly
// removed data

//   Pick<SubscriptionDTO, "_id" | "startDate" | "endDate" | "subscriptionStatus"> &
//   Partial<Pick<PlanDTO, "planName">>>

// needed data 

export type FindSubscriptionsByProviderIdResponse = Array<Partial<Pick<PaymentDTO, "totalAmount">>>;

// Omit<SubscriptionDTO, 'subscriptionPlanId' | "paymentId"> & {
//     subscriptionPlanId: {
//         planName: PlanDTO["planName"];
//     },
// export type PopulatedSubscription = 
//     paymentId: {
//       totalAmount: string;
//     }
// ;


// **** subscription queries findDetails method response payment data fething model

// type SubscriptionProps = Pick<SubscriptionDTO, "startDate" | "endDate" | "subscriptionStatus" | "createdAt">;
type PaymentsProps = Pick<PaymentDTO, "transactionId" | "discountAmount" | "initialAmount" | "paymentFor" | "paymentGateway" | "paymentMethod" | "paymentStatus" | "totalAmount">;
// type PlanProps = Pick<PlanDTO, "planName" | "price" | "adVisibility" | "maxBookingPerMonth">;
export interface findSubscriptionFullDetailsResProps {
//  SubscriptionProps
//   subscriptionPlanId: PlanProps,
  paymentId: PaymentsProps | null,
}
