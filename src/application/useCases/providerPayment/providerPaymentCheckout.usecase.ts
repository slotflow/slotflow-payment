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
            subscriptionId,
            providerId,
            planName,
            description,
            planDuration,
            unitAmount,
            paymentFor,
            paymentDate,
            name,
            email,
            initialAmount,
        } = payload;

        try {

            console.log("successUrl : ",serviceConfig.frontendUrl + providerPaymentSuccessUrl);
            console.log("cancelUrl : ",serviceConfig.frontendUrl + providerPaymentFailedUrl);

            const result = await this.paymentGateway.subscriptionCreateCheckoutSession({
                subscriptionId,
                providerId,
                planName,
                description,
                planDuration,
                unitAmount,
                paymentFor,
                paymentDate: paymentDate.toISOString(),
                name,
                email,
                initialAmount,
                successUrl: serviceConfig.frontendUrl + providerPaymentSuccessUrl,
                cancelUrl: serviceConfig.frontendUrl + providerPaymentFailedUrl,
            });

            return result.sessionId;
        } catch (error) {
            log.error("ProviderPaymentCheckoutUseCase failed : ", error as Error);
            throw error;
        };
    };
};