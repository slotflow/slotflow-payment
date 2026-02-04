import { log } from "../../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { DecodedUser } from "../../../application/dtos/common.dtos";
import { providerFetchAllPaymentsUseCase, providerPaymentCheckoutUseCase } from "..";
import { providerIdWithPaginationSchema, providerSubscipriotonCheckoutSchema } from "../../../shared/zod/payment.zod";
import { ProviderPaymentCheckoutUseCase } from "../../../application/useCases/providerPayment/providerPaymentCheckout.usecase";
import { ProviderFetchAllPaymentsUseCase } from "../../../application/useCases/providerPayment/providerFetchAllPayments.useCase";

class ProviderPaymentController {

    constructor(
        private readonly providerPaymentCheckoutUseCase: ProviderPaymentCheckoutUseCase,
        private readonly providerFetchAllPaymentsUseCase: ProviderFetchAllPaymentsUseCase
    ) {
        this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
        this.getPayments = this.getPayments.bind(this);
    };

    async subscriptionCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = providerSubscipriotonCheckoutSchema.parse(req.body);
            const result = await this.providerPaymentCheckoutUseCase.execute({
                ...validatedData,
                paymentDate: new Date(validatedData.paymentDate),
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("providerSubscriptionCheckout failed : ", error as Error);
            next(error);
        };
    };

    async getPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const { limit, page, providerId } = providerIdWithPaginationSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.query
            });
            const result = await this.providerFetchAllPaymentsUseCase.execute({ providerId, page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getPayments failed", error as Error);
            next(error);
        };
    };

};

export const providerPaymentController = new ProviderPaymentController(
    providerPaymentCheckoutUseCase,
    providerFetchAllPaymentsUseCase
);