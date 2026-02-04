import { log } from "../../shared/logger/logger";
import { providerPaymentCheckoutUseCase } from ".";
import { NextFunction, Request, Response } from "express";
import { providerSubscipriotonCheckoutSchema } from "../../shared/zod/payment.zod";
import { ProviderPaymentCheckoutUseCase } from "../../application/useCases/providerPayment/providerPaymentCheckout.usecase";

class PaymentController {
    constructor(
        private readonly providerPaymentCheckoutUseCase: ProviderPaymentCheckoutUseCase
    ) {
        this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
    };

    async subscriptionCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = providerSubscipriotonCheckoutSchema.parse(req.body);
            const result = await this.providerPaymentCheckoutUseCase.execute({
                ...validatedData,
                paymentDate: new Date(validatedData.paymentDate),
            });
            return res.status(200).json({
                success: true,
                message: "Provider subscription checkout successful",
                data: result,
            });
        } catch (error) {
            log.error("providerSubscriptionCheckout failed : ", error as Error);
            next(error);
        };
    };
};

export const paymentController = new PaymentController(
    providerPaymentCheckoutUseCase
);