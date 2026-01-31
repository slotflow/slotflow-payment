export const notificationContentMap: Record<string, {
  title: string;
  body: (...args: any[]) => string;
}> = {
  providerSubscriptionPayment: {
    title: "Subscription Payment Success",
    body: (planDuration: string) =>
      `Your ${planDuration} subscription payment has been processed successfully.`
  },
};