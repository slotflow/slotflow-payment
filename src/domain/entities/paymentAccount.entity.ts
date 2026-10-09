import { PaymentAccountStatus } from "../enums/payment.enum";
import { PaymentAccountProps } from "../contracts/paymentAccount.contract";
import {
  CreatePaymentAccountProps,
  PaypalDetails,
  RazorpayDetails,
  StripeDetails,
} from "../commands/paymentAccount.command";

export class PaymentAccount {
  private props: PaymentAccountProps;

  constructor(props: PaymentAccountProps) {
    this.props = props;
  }

  static create(props: CreatePaymentAccountProps): PaymentAccount {
    const now = new Date();
    return new PaymentAccount({
      _id: "",
      userId: props.userId,
      stripeData: {
        customerId: null,
        accountId: null,
        accountStatus: PaymentAccountStatus.NOT_CONNECTED,
      },
      paypalData: {
        merchantId: null,
        payerId: null,
        accountStatus: PaymentAccountStatus.NOT_CONNECTED,
      },
      razorpayData: {
        accountId: null,
        customerId: null,
        accountStatus: PaymentAccountStatus.NOT_CONNECTED,
      },
      createdAt: now,
      updatedAt: now,
    });
  }

  get _id(): string {
    return this.props._id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get stripeData(): StripeDetails | null | undefined {
    return this.props.stripeData;
  }

  get paypalData(): PaypalDetails | null | undefined {
    return this.props.paypalData;
  }

  get razorpayData(): RazorpayDetails | null | undefined {
    return this.props.razorpayData;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateStripeData(stripeData: StripeDetails): void {
    this.props.stripeData = stripeData;
    this.props.updatedAt = new Date();
  }

  public updatePaypalData(paypalData: PaypalDetails): void {
    this.props.paypalData = paypalData;
    this.props.updatedAt = new Date();
  }

  public updateRazorpayData(razorpayData: RazorpayDetails): void {
    this.props.razorpayData = razorpayData;
    this.props.updatedAt = new Date();
  }

  public getProps(): PaymentAccountProps {
    return { ...this.props };
  }
}
