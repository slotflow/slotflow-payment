import { stripeClient } from "./stripe.client";
import { PaymentGateway } from "./paymentGateway.service.impl";
import { IPaymentGateway } from "../../application/interfaces/payment/IPaymentGateway.service";

export const paymentGateway: IPaymentGateway = new PaymentGateway(stripeClient);