export enum PaymentFor {
    ProviderSubscription = "ProviderSubscription",
    AppointmentBooking = "AppointmentBooking",
    ProviderPayout = "ProviderPayout",
    CancelBooking = "CancelBooking",
    CancelSubscription = "CancelSubscription",
};

export enum PaymentGateway {
    Stripe = "Stripe",
    Razorpay = "Razorpay",
    Paypal = "Paypal"
};

export enum PaymentMethod {
    Card = "card",
    Upi = "upi",
    Wallet = "wallet",
    NetBanking = "netBanking",
};

export enum PaymentStatus {
    Pending = "Pending",
    Paid = "Paid",
    Failed = "Failed",
    Cancelled = "Cancelled",
    Refunded = "Refunded",
};
