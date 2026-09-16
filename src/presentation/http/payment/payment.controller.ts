import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { AuthUser } from "../../../application/dtos/common.dtos";
import { startAndEndDateSchema, validateEmailSchema } from "../../../shared/zod/common.zod";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { RefundPaymentUseCase } from "../../../application/useCases/payment/refundPayment.useCase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/bookingCheckout.useCase";
import { StripeAccountLinkUseCase } from "../../../application/useCases/stripe/stripeAccountLink.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { GetAdminRevenueReportUseCase } from "../../../application/useCases/payment/getRevenueReport.useCase";
import { GetAdminRevenueStatsUseCase } from "../../../application/useCases/payment/getAdminRevenueStats.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscriptionCheckout.useCase";
import { GetStripeAccountStatusUseCase } from "../../../application/useCases/stripe/getStripeAccountStatus.useCase";
import { GetProviderRevenueStatsUseCase } from "../../../application/useCases/payment/getProviderRevenueStats.useCase";
import { GetAdminRevenueAanalyticsUseCase } from "../../../application/useCases/payment/getAdminRevenueAnalytics.useCase";
import { bookingCheckoutShcema, getAdminRevenueReportSchema, getPaymentDetailsSchema, getPaymentsSchema, refundSchema, stripeAccountIdSchema, subscipriotonCheckoutSchema } from "../../../shared/zod/payment.zod";
import { getPaymentsUseCase, getPaymentDetailsUseCase, subscriptionCheckoutUseCase, bookingCheckoutUseCase, getAdminRevenueReportUseCase, getAdminRevenueStatsUseCase, getProviderRevenueStatsUseCase, refundPaymentUseCase, stripeAccountLinkUseCase, getStripeAccountStatusUseCase, getAdminRevenueAanalyticsUseCase } from ".";

class PaymentController {

    constructor(
        private readonly getPaymentsUseCase: GetPaymentsUseCase,
        private readonly getPaymentDetailsUseCase: GetPaymentDetailsUseCase,
        private readonly subscriptionCheckoutUseCase: SubscriptionCheckoutUseCase,
        private readonly bookingCheckoutUseCase: BookingCheckoutUseCase,
        private readonly getAdminRevenueReportUseCase: GetAdminRevenueReportUseCase,
        private readonly getAdminRevenueStatsUseCase: GetAdminRevenueStatsUseCase,
        private readonly getProviderRevenueStatsUseCase: GetProviderRevenueStatsUseCase,
        private readonly refundPaymentUseCase: RefundPaymentUseCase,
        private readonly stripeAccountLinkUseCase: StripeAccountLinkUseCase,
        private readonly getStripeAccountStatusUseCase: GetStripeAccountStatusUseCase,
        private readonly getAdminRevenueAanalyticsUseCase: GetAdminRevenueAanalyticsUseCase
    ) {
        this.getPayments = this.getPayments.bind(this);
        this.getPaymentDetails = this.getPaymentDetails.bind(this);
        this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
        this.bookingCheckout = this.bookingCheckout.bind(this);
        this.getRevenueReport = this.getRevenueReport.bind(this);
        this.getRevenue = this.getRevenue.bind(this);
        this.refund = this.refund.bind(this);
        this.linkStripeAccount = this.linkStripeAccount.bind(this);
        this.getStripeAccountStatus = this.getStripeAccountStatus.bind(this);
        this.getRevenueAnalytics = this.getRevenueAnalytics.bind(this);
    };

    async getPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
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
            const user = req.user as AuthUser;
            const validatedData = subscipriotonCheckoutSchema.parse(req.body);
            const result = await this.subscriptionCheckoutUseCase.execute({
                ...validatedData,
                ...user,
                userId: user.id
            });
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
            console.log("req.body : ", req.body);
            console.log("req.query : ", req.query);
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
            console.log("result : ", result);
            sendResponse(res, result);
        } catch (error) {
            log.error("getRevenueReport failed", error as Error);
            next(error);
        };
    };

    async getRevenue(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const validatedData = startAndEndDateSchema.parse(req.query);
            if (user.role === Role.PROVIDER) {
                const result = await this.getProviderRevenueStatsUseCase.execute({
                    providerId: user.id,
                    ...validatedData
                });
                sendResponse(res, result);
            }
            if (user.role === Role.ADMIN) {
                const result = await this.getAdminRevenueStatsUseCase.execute(validatedData);
                sendResponse(res, result);
            }
        } catch (error) {
            log.error("getRevenue failed", error as Error);
            next(error);
        };
    };

    async refund(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = refundSchema.parse(req.body);
            await this.refundPaymentUseCase.execute({
                ...validatedData,
            });
            sendResponse(res, null);
        } catch (error) {
            log.error("refund failed", error as Error);
            next(error);
        }
    }

    async linkStripeAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
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

    async getStripeAccountStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { accountId } = stripeAccountIdSchema.parse(req.params);
            const result = await this.getStripeAccountStatusUseCase.execute({
                accountId,
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("getStripeAccountStatus failed", error as Error);
            next(error);
        }
    }

    async getRevenueAnalytics(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const validatedData = startAndEndDateSchema.parse(req.query);
            // TODO provider dashboard revenue stats
            if (user.role === Role.PROVIDER) {
                const result = await this.getProviderRevenueStatsUseCase.execute({
                    providerId: user.id,
                    ...validatedData
                });
                sendResponse(res, result);
            }
            if (user.role === Role.ADMIN) {
                const result = await this.getAdminRevenueAanalyticsUseCase.execute(validatedData);
                sendResponse(res, result);
            }
        } catch (error) {
            log.error("getRevenueAnalytics failed", error as Error);
            next(error);
        };
    };

};

export const paymentController = new PaymentController(
    getPaymentsUseCase,
    getPaymentDetailsUseCase,
    subscriptionCheckoutUseCase,
    bookingCheckoutUseCase,
    getAdminRevenueReportUseCase,
    getAdminRevenueStatsUseCase,
    getProviderRevenueStatsUseCase,
    refundPaymentUseCase,
    stripeAccountLinkUseCase,
    getStripeAccountStatusUseCase,
    getAdminRevenueAanalyticsUseCase
);