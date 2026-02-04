import { log } from "../../../shared/logger/logger";
import { serviceConfig } from "../../../config/env";
import { ProviderPaymentCheckoutRequest } from "../../dtos/payment.dtos";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { providerPaymentFailedUrl, providerPaymentSuccessUrl } from "../../../shared/utils/constants";

export class ProviderPaymentCheckoutUseCase {

    constructor(
        private readonly paymentGateway: IPaymentGateway
    ) { };

    async execute(payload: ProviderPaymentCheckoutRequest): Promise<string> {

        const { 
            description,
            planDuration,
            planName,
            unitAmount,
            subscriptionId,
            providerId,
            totalAmount,
            paymentFor,
            paymentDate,
            name,
            email,
            initialAmount,
            discountAmount
        } = payload;

        try {

            const result = await this.paymentGateway.subscriptionCreateCheckoutSession({
                planName,
                description,
                unitAmount,
                planDuration,
                subscriptionId,
                providerId,
                successUrl: serviceConfig.frontendUrl + providerPaymentSuccessUrl,
                cancelUrl: serviceConfig.frontendUrl + providerPaymentFailedUrl,
                totalAmount,
                paymentFor,
                paymentDate: paymentDate.toISOString(),
                name,
                email,
                initialAmount,
                discountAmount,
            });

            return result.sessionId;
        } catch (error) {
            log.error("ProviderPaymentCheckoutUseCase failed : ", error as Error);
            throw error;
        };
    };
};