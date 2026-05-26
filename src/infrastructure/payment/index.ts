import { stripe } from "./stripe.client";
import { PaymentGateway } from "./paymentGateway";
import { IPaymentGateway } from "../../domain/interfaces/payment/IPaymentGateway";

export const paymentGateway: IPaymentGateway = new PaymentGateway(stripe);