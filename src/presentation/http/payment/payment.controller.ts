import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { DecodedUser } from "../../../application/dtos/common.dtos";
import { startAndEndDateSchema, validateEmailSchema } from "../../../shared/zod/common.zod";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { RefundPaymentUseCase } from "../../../application/useCases/payment/refundPayment.useCase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/bookingCheckout.useCase";
import { GetAdminRevenueUseCase } from "../../../application/useCases/payment/getAdminRevenue.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { StripeAccountLinkUseCase } from "../../../application/useCases/payment/stripeAccountLink.useCase";
import { GetProviderRevenueUseCase } from "../../../application/useCases/payment/getProviderRevenue.useCase";
import { GetAdminRevenueReportUseCase } from "../../../application/useCases/payment/getRevenueReport.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscriptionCheckout.usecase";
import { bookingCheckoutShcema, getAdminRevenueReportSchema, getPaymentDetailsSchema, getPaymentsSchema, refundSchema, subscipriotonCheckoutSchema } from "../../../shared/zod/payment.zod";
import { getPaymentsUseCase, getPaymentDetailsUseCase, subscriptionCheckoutUseCase, bookingCheckoutUseCase, getAdminRevenueReportUseCase, stripeAccountLinkUseCase, getAdminRevenueUseCase, getProviderRevenueUseCase, refundPaymentUseCase } from ".";

class PaymentController {

    constructor(
        private readonly getPaymentsUseCase: GetPaymentsUseCase,
        private readonly getPaymentDetailsUseCase: GetPaymentDetailsUseCase,
        private readonly subscriptionCheckoutUseCase: SubscriptionCheckoutUseCase,
        private readonly bookingCheckoutUseCase: BookingCheckoutUseCase,
        private readonly getAdminRevenueReportUseCase: GetAdminRevenueReportUseCase,
        private readonly stripeAccountLinkUseCase: StripeAccountLinkUseCase,
        private readonly getAdminRevenueUseCase: GetAdminRevenueUseCase,
        private readonly getProviderRevenueUseCase: GetProviderRevenueUseCase,
        private readonly refundPaymentUseCase: RefundPaymentUseCase
    ) {
        this.getPayments = this.getPayments.bind(this);
        this.getPaymentDetails = this.getPaymentDetails.bind(this);
        this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
        this.bookingCheckout = this.bookingCheckout.bind(this);
        this.getRevenueReport = this.getRevenueReport.bind(this);
        this.linkStripeAccount = this.linkStripeAccount.bind(this);
        this.getRevenue = this.getRevenue.bind(this);
        this.refund = this.refund.bind(this);
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
                filters.providerId = user.id;
            } else if (user.role === Role.USER) {
                filters.userId = user.id;
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

    async getRevenueReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { endDate, limit, page, startDate } = getAdminRevenueReportSchema.parse({
                ...req.body,
                ...req.query
            });
            const result = await this.getAdminRevenueReportUseCase.execute({
                page,
                limit,
                startDate,
                endDate
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("getRevenueReport failed", error as Error);
            next(error);
        };
    };

    async linkStripeAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { email } = validateEmailSchema.parse(req.body);
            const result = await this.stripeAccountLinkUseCase.execute({
                email,
                userId: user.id,
            });
            sendResponse(res, result, "Stripe connected");
        } catch (error) {
            log.error("connectStripe failed", error as Error);
            next(error);
        };
    };

    async getRevenue(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const validatedData = startAndEndDateSchema.parse(req.query);
            if(user.role === Role.PROVIDER) {
                const result = await this.getProviderRevenueUseCase.execute({
                    providerId: user.id,
                    ...validatedData
                });
                sendResponse(res, result);
            }
            if(user.role === Role.ADMIN) {
                const result = await this.getAdminRevenueUseCase.execute(validatedData);
                sendResponse(res, result);
            }
        } catch (error) {
            log.error("getRevenue failed", error as Error);
            next(error);
        };
    };

    async refund(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const validatedData = refundSchema.parse(req.body);
            await this.refundPaymentUseCase.execute({
                ...validatedData,
                userId: user.id,
            });
            sendResponse(res, null);
        } catch (error) {
            log.error("refund failed", error as Error);
            next(error);
        }
    }

};

export const paymentController = new PaymentController(
    getPaymentsUseCase,
    getPaymentDetailsUseCase,
    subscriptionCheckoutUseCase,
    bookingCheckoutUseCase,
    getAdminRevenueReportUseCase,
    stripeAccountLinkUseCase,
    getAdminRevenueUseCase,
    getProviderRevenueUseCase,
    refundPaymentUseCase
);