import { RefundStatus } from "../../domain/enums/refund.enum";

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
  refundPayment: {
    title: "Refund Initiated",
    body: (refundStatus: RefundStatus) => {
      switch (refundStatus) {
        case RefundStatus.SUCCESS:
          return `Your refund has been initiated successfully.`;
        case RefundStatus.FAILED:
          return `Your refund has been failed.`;
        default:
          return "Your refund has been failed.";
      }
    }
  }
};

// payment urls
export const providerPaymentSuccessUrl = "/provider/subscription/confirm?status=success";
export const providerPaymentFailedUrl = "/provider/subscription/confirm?status=failed";

export const bookingPaymentSuccessUrl = "/user/booking/confirm?status=success";
export const bookingPaymentFailedUrl = "/user/booking/confirm?status=failed";