export enum RefundStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCEEDED",
  FAILED = "FAILED",
}

export enum RefundReason {
  DUPLICATE = "duplicate",
  FRAUDULENT = "fraudulent",
  REQUESTED_BY_CUSTOMER = "requested_by_customer",
}

export enum RefundFor {
  CANCEL_BOOKING = "CANCEL_BOOKING",
  CANCEL_SUBSCRIPTION = "CANCEL_SUBSCRIPTION",
}
