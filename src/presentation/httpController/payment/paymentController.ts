import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { DecodedUser } from "../../../application/dtos/common.dtos";
import { getPaymentsUseCase, getPaymentDetailsUseCase, subscriptionCheckoutUseCase, bookingCheckoutUseCase } from ".";
import { bookingCheckoutShcema, getPaymentDetailsSchema, getPaymentsSchema, subscipriotonCheckoutSchema } from "../../../shared/zod/payment.zod";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscriptionCheckout.usecase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/bookingCheckout.useCase";

class PaymentController {

    constructor(
        private readonly getPaymentsUseCase: GetPaymentsUseCase,
        private readonly getPaymentDetailsUseCase: GetPaymentDetailsUseCase,
        private readonly subscriptionCheckoutUseCase: SubscriptionCheckoutUseCase,
        private readonly bookingCheckoutUseCase: BookingCheckoutUseCase
    ) {
        this.getPayments = this.getPayments.bind(this);
        this.getPaymentDetails = this.getPaymentDetails.bind(this);
        this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
        this.bookingCheckout = this.bookingCheckout.bind(this);
    };

    async getPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;

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
            const validatedData = subscipriotonCheckoutSchema.parse(req.body);
            const result = await this.subscriptionCheckoutUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("providerSubscriptionCheckout failed : ", error as Error);
            next(error);
        };
    };

    async bookingCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = bookingCheckoutShcema.parse(req.body);
            const result = await this.bookingCheckoutUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("bookingCheckout failed : ", error as Error);
            next(error);
        }
    }

};

export const paymentController = new PaymentController(
    getPaymentsUseCase,
    getPaymentDetailsUseCase,
    subscriptionCheckoutUseCase,
    bookingCheckoutUseCase
);