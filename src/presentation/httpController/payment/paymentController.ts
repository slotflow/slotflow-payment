import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { DecodedUser } from "../../../application/dtos/common.dtos";
import { getPaymentsUseCase, getPaymentDetailsUseCase, providerPaymentCheckoutUseCase } from ".";
import { getPaymentDetailsSchema, getPaymentsSchema, providerSubscipriotonCheckoutSchema } from "../../../shared/zod/payment.zod";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { ProviderPaymentCheckoutUseCase } from "../../../application/useCases/payment/providerPaymentCheckout.usecase";

class PaymentController {

    constructor(
        private readonly getPaymentsUseCase: GetPaymentsUseCase,
        private readonly getPaymentDetailsUseCase: GetPaymentDetailsUseCase,
        private readonly providerPaymentCheckoutUseCase: ProviderPaymentCheckoutUseCase,
    ) {
        this.getPayments = this.getPayments.bind(this);
        this.getPaymentDetails = this.getPaymentDetails.bind(this);
        this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
    };

    async getPayments(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("req.query : ", req.query);
            const user = req.user as DecodedUser;
            console.log("user : ", user);

            const { userId, providerId, page, limit } =
                getPaymentsSchema.parse(req.query);


            let filters: {
                userId?: string;
                providerId?: string;
            } = {};

            if (user.role === Role.ADMIN) {
                filters.userId = userId;
                filters.providerId = providerId;
            } else if (user.role === Role.PROVIDER) {
                filters.providerId = user.userOrProviderId;
            } else if (user.role === Role.USER) {
                filters.userId = user.userOrProviderId;
            } else {
                return res.status(403).json({ message: "Forbidden" });
            }

            const result = await this.getPaymentsUseCase.execute({
                ...filters,
                page,
                limit,
            });

            sendResponse(res, result);
        } catch (error) {
            log.error("getPayments failed", error as Error);
            next(error);
        };
    };

    async getPaymentDetails(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("req.params : ", req.params);
            const { paymentId } = getPaymentDetailsSchema.parse(req.params);

            const result = await this.getPaymentDetailsUseCase.execute({
                paymentId,
            });

            sendResponse(res, result);
        } catch (error) {
            log.error("getPaymentDetails failed", error as Error);
            next(error);
        };
    };

    async subscriptionCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("req.body : ", req.body);
            const validatedData = providerSubscipriotonCheckoutSchema.parse(req.body);
            const result = await this.providerPaymentCheckoutUseCase.execute({
                ...validatedData,
                paymentDate: new Date(validatedData.paymentDate),
            });
            console.log("result : ", result);
            sendResponse(res, result);
        } catch (error) {
            log.error("providerSubscriptionCheckout failed : ", error as Error);
            next(error);
        };
    };

    async bookingCheckout(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            log.error("bookingCheckout failed : ", error as Error);
            next(error);
        }
    }

};

export const paymentController = new PaymentController(
    getPaymentsUseCase,
    getPaymentDetailsUseCase,
    providerPaymentCheckoutUseCase

);