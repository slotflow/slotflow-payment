import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { AuthUser } from "../../../application/dtos/common.dtos";
import { sendResponse } from "../../../shared/utils/helpers/response";
import { GetPaymentsUseCase } from "../../../application/useCases/payment/getPayments.useCase";
import { RefundPaymentUseCase } from "../../../application/useCases/payment/refundPayment.useCase";
import { StripeAccountLinkUseCase } from "../../../application/useCases/stripe/stripeAccountLink.useCase";
import { GetPaymentDetailsUseCase } from "../../../application/useCases/payment/getPaymentDetails.useCase";
import { GetAdminRevenueReportUseCase } from "../../../application/useCases/payment/getRevenueReport.useCase";
import { BookingCheckoutUseCase } from "../../../application/useCases/payment/booking/bookingCheckout.useCase";
import {
  getRevenueAnalyticsSchema,
  getRevenueStatsSchema,
  validateEmailSchema,
} from "../../../shared/zod/common.zod";
import { GetAdminRevenueStatsUseCase } from "../../../application/useCases/payment/revenue/getAdminRevenueStats.useCase";
import { GetStripeAccountStatusUseCase } from "../../../application/useCases/paymentAccount/getStripeAccountStatus.useCase";
import { SubscriptionCheckoutUseCase } from "../../../application/useCases/payment/subscription/subscriptionCheckout.useCase";
import { GetProviderRevenueStatsUseCase } from "../../../application/useCases/payment/revenue/getProviderRevenueStats.useCase";
import { GetAdminRevenueAanalyticsUseCase } from "../../../application/useCases/payment/revenue/getAdminRevenueAnalytics.useCase";
import {
  bookingCheckoutShcema,
  getAdminRevenueReportSchema,
  getPaymentDetailsSchema,
  getPaymentsSchema,
  // refundSchema,
  subscipriotonCheckoutSchema,
} from "../../../shared/zod/payment.zod";
import {
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
  getAdminRevenueAanalyticsUseCase,
} from ".";

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
    private readonly getAdminRevenueAanalyticsUseCase: GetAdminRevenueAanalyticsUseCase,
  ) {
    this.getPayments = this.getPayments.bind(this);
    this.getPaymentDetails = this.getPaymentDetails.bind(this);
    this.subscriptionCheckout = this.subscriptionCheckout.bind(this);
    this.bookingCheckout = this.bookingCheckout.bind(this);
    this.getRevenueReport = this.getRevenueReport.bind(this);
    this.getRevenueStats = this.getRevenueStats.bind(this);
    this.refund = this.refund.bind(this);
    this.linkStripeAccount = this.linkStripeAccount.bind(this);
    this.getStripeAccountStatus = this.getStripeAccountStatus.bind(this);
    this.getRevenueAnalytics = this.getRevenueAnalytics.bind(this);
  }

  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const { userId, providerId, page, limit } = getPaymentsSchema.parse(req.query);
      const filters: {
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
      log.error("getPayments failed", { error });
      next(error);
    }
  }

  async getPaymentDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId } = getPaymentDetailsSchema.parse(req.params);
      const result = await this.getPaymentDetailsUseCase.execute({
        paymentId,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getPaymentDetails failed", { error });
      next(error);
    }
  }

  async subscriptionCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = subscipriotonCheckoutSchema.parse(req.body);
      const result = await this.subscriptionCheckoutUseCase.execute({
        ...validatedData,
        ...user,
        userId: user.id,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("providerSubscriptionCheckout failed : ", { error });
      next(error);
    }
  }

  async bookingCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = bookingCheckoutShcema.parse(req.body);
      const result = await this.bookingCheckoutUseCase.execute({
        ...validatedData,
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("bookingCheckout failed : ", { error });
      next(error);
    }
  }

  async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const { endDate, limit, page, startDate } = getAdminRevenueReportSchema.parse({
        ...req.body,
        ...req.query,
      });
      const result = await this.getAdminRevenueReportUseCase.execute({
        page,
        limit,
        startDate,
        endDate,
        timeZone: user.timeZone.value,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getRevenueReport failed", { error });
      next(error);
    }
  }

  async getRevenueStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = getRevenueStatsSchema.parse(req.query);
      if (user.role === Role.PROVIDER) {
        const result = await this.getProviderRevenueStatsUseCase.execute({
          ...validatedData,
          providerId: user.id,
          timeZone: user.timeZone.value,
        });
        sendResponse(res, result);
      }
      if (user.role === Role.ADMIN) {
        const result = await this.getAdminRevenueStatsUseCase.execute({
          ...validatedData,
          timeZone: user.timeZone.value,
        });
        sendResponse(res, result);
      }
    } catch (error) {
      log.error("getRevenue failed", { error });
      next(error);
    }
  }

  async refund(_req: Request, res: Response, next: NextFunction) {
    try {
      // const validatedData = refundSchema.parse(req.body);
      await this.refundPaymentUseCase.execute(
        // {...validatedData }
      );
      sendResponse(res, null);
    } catch (error) {
      log.error("refund failed", { error });
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
      log.error("connectStripe failed", { error });
      next(error);
    }
  }

  async getStripeAccountStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const result = await this.getStripeAccountStatusUseCase.execute({
        userId: user.id,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getStripeAccountStatus failed", { error });
      next(error);
    }
  }

  async getRevenueAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = getRevenueAnalyticsSchema.parse(req.query);
      // TODO provider dashboard revenue stats
      if (user.role === Role.PROVIDER) {
        const result = await this.getProviderRevenueStatsUseCase.execute({
          ...validatedData,
          providerId: user.id,
          timeZone: user.timeZone.value,
        });
        sendResponse(res, result);
      }
      if (user.role === Role.ADMIN) {
        const result = await this.getAdminRevenueAanalyticsUseCase.execute({
          ...validatedData,
          timeZone: user.timeZone.value,
        });
        sendResponse(res, result);
      }
    } catch (error) {
      log.error("getRevenueAnalytics failed", { error });
      next(error);
    }
  }
}

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
  getAdminRevenueAanalyticsUseCase,
);
