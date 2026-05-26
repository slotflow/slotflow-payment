import { serviceConfig } from "../../../config/env";
import { IdType } from "../../../shared/utils/types";
import { Role } from "../../../domain/enums/common.enum";
import { generateId } from "../../../shared/utils/generateId";
import { BadRequestError } from "../../../shared/error/appError";
import { SubscriptionCheckoutInput } from "../../dtos/payment.dtos";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { CreateStripeCustomerUseCase } from "../stripe/createStripeCustomer.useCase";
import { providerPaymentFailedUrl, providerPaymentSuccessUrl } from "../../../shared/utils/constants";

export class SubscriptionCheckoutUseCase {

    constructor(
        private readonly paymentGateway: IPaymentGateway,
        private readonly createStripeCustomer: CreateStripeCustomerUseCase
    ) { };

    async execute(input: SubscriptionCheckoutInput): Promise<string> {
        try {
            const {
                subscriptionId,
                providerId,
                planName,
                description,
                planDuration,
                unitAmount,
                paymentFor,
                name,
                email,
                initialAmount,
                stripeCustomerId
            } = input;

            if (!subscriptionId ||
                !providerId ||
                !planName ||
                !description ||
                !planDuration ||
                !unitAmount ||
                !paymentFor ||
                !name ||
                !email ||
                !initialAmount) {
                throw new BadRequestError();
            }

            let customerId: string | undefined = stripeCustomerId;

            if (!customerId) {
                const customer = await this.createStripeCustomer.execute({
                    email,
                    username: name,
                    userId: providerId,
                    role: Role.PROVIDER
                });

                customerId = customer.stripeCustomerId;
            }

            const result = await this.paymentGateway.createSubscriptionCheckoutSession({
                subscriptionId,
                providerId,
                planName,
                description,
                planDuration,
                unitAmount,
                paymentFor,
                name,
                email,
                initialAmount,
                stripeCustomerId: customerId,
                successUrl: serviceConfig.frontendUrl + providerPaymentSuccessUrl,
                cancelUrl: serviceConfig.frontendUrl + providerPaymentFailedUrl,
            });

            return result.sessionId;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create subscription checkout");
        };
    };
};