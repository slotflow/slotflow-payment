import { RefundStatus } from "../../domain/enums/refund.enum";
import { IdType } from "./types";

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

export const PREFIX_MAP: Record<IdType, string> = {
  [IdType.EVENT]: "sf_evt_",
  [IdType.TRANSACTION]: "sf_trx_",
  [IdType.ROOM]: "sf_room_",
  [IdType.IDEMPOTENCY]: "sf_idem_",
  [IdType.FILE]: "sf_file_",
};