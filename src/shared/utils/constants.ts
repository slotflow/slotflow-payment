// notification content
export const notificationContentMap: Record<string, {
  title: string;
  body: (...args: any[]) => string;
}> = {
  providerSubscriptionPayment: {
    title: "Payment Received",
    body: () =>
      `Your payment has been received successfully. Your subscription is being activated`
  },
  bookingPaymentSuccess: {
    title: "Payment Received",
    body: () =>
      `Your payment has been received successfully. Your booking is being confirmed`
  },
};

// payment urls
export const providerPaymentSuccessUrl = "/provider/subscription/confirm?status=success";
export const providerPaymentFailedUrl = "/provider/subscription/confirm?status=failed";

export const bookingPaymentSuccessUrl = "/user/booking/confirm?status=success";
export const bookingPaymentFailedUrl = "/user/booking/confirm?status=failed";