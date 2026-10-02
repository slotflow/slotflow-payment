import { BadRequestError } from "../../../shared/error/appError";
import { paymentGateway } from "../../../infrastructure/payment";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IPaymentGateway } from "../../interfaces/payment/IPaymentGateway.service";
import { CreateStripeCustomerInput, CreateStripeCustomerOutput } from "../../dtos/stripe.dtos";

export class CreateStripeCustomerUseCase {
    constructor(
        private readonly paymentGateway: IPaymentGateway,
    ) { }

    async execute(input: CreateStripeCustomerInput): Promise<CreateStripeCustomerOutput> {
        try {
            const { email, role, userId, username } = input;
            if (!email || !username || !userId || !role) {
                throw new BadRequestError();
            }

            const existingCustomer = await this.paymentGateway.findCustomerByUserId(userId);

            if (existingCustomer) {
                return {
                    stripeCustomerId: existingCustomer.customerId
                };
            }

            const customer = await this.paymentGateway.createStripeCustomer({
                email,
                name: username,
                userId,
                role,
            });

            return {
                stripeCustomerId: customer.customerId
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create stripe customer");
        }
    }
}

export const createStripeCustomerUseCase = new CreateStripeCustomerUseCase(paymentGateway);