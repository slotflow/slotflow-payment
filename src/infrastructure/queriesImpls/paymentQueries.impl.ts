import { Types } from "mongoose";
import { PaymentModel } from "../databse/payment.model";
import { TableData } from "../../application/dtos/common.dtos";
import { IPaymentQueries } from "../../application/queries/IPayment.queries";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../../domain/enums/payment.enum";
import { endOfDay, getStartAndEndDate, startOfDay, startOfMonth, startOfToday, startOfTomorrow } from "../../shared/utils/dateTime";
import { AdminFetchDashboardRevenueStatsDataRequest, AdminFetchDashboardRevenueStatsDataResponse, GetAdminRevenueReportRequest, GetAdminRevenueReportResponse, ProviderFetchDashboardPaymentStatsDataResponse } from "../../application/dtos/payment.dtos";

export class PaymentQueriesImpl implements IPaymentQueries {

    async findAdminRevenueReport(payload: GetAdminRevenueReportRequest): Promise<TableData<GetAdminRevenueReportResponse>> {
        const { endDate, limit, page, startDate } = payload;
        const skip = (page - 1) * limit;
        const match: Record<string, any> = {
            paymentStatus: PaymentStatus.PAID,
            paymentFor: { $in: [PaymentFor.PROVIDER_SUBSCRIPTION, PaymentFor.APPOINTMENT_BOOKING] },
        };

        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = startDate;
            if (endDate) match.createdAt.$lte = endDate;
        }

        const revenueReportData = await PaymentModel.aggregate([
            { $match: match },

            {
                $facet: {
                    rows: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                createdAt: 1,
                                discountAmount: 1,
                                initialAmount: 1,
                                totalAmount: 1,
                                paymentGateway: 1,
                                paymentFor: 1,
                            },
                        },
                    ],

                    grandTotals: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },

                        {
                            $group: {
                                _id: null,
                                grandTotal: { $sum: "$totalAmount" },
                                grandDiscount: { $sum: "$discountAmount" },
                                grandInitalAmount: { $sum: "$initialAmount" },
                            },
                        },
                    ],
                },
            },

            {
                $project: {
                    rows: 1,
                    grandTotal: { $ifNull: [{ $arrayElemAt: ["$grandTotals.grandTotal", 0] }, 0] },
                    grandDiscount: { $ifNull: [{ $arrayElemAt: ["$grandTotals.grandDiscount", 0] }, 0] },
                    grandInitalAmount: { $ifNull: [{ $arrayElemAt: ["$grandTotals.grandInitalAmount", 0] }, 0] },
                },
            },
        ]).allowDiskUse(true);

        const totalCount = await PaymentModel.countDocuments(match);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: {
                rows: revenueReportData[0].rows,
                grandTotal: revenueReportData[0].grandTotal,
                grandDiscount: revenueReportData[0].grandDiscount,
                grandInitalAmount: revenueReportData[0].grandInitalAmount,
            },
            totalPages,
            currentPage: page,
            totalCount,
        };
    };

    async findStatsDataForAdminDashboard(payload: AdminFetchDashboardRevenueStatsDataRequest): Promise<AdminFetchDashboardRevenueStatsDataResponse> {
        const { startDate, endDate } = getStartAndEndDate(payload.startDate, payload.endDate);
        const paymentData = await PaymentModel.aggregate([
            {
                $match: {
                    paymentStatus: PaymentStatus.PAID,
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                }
            },
            {
                $facet: {
                    totalRevenue: [
                        { $match: { paymentFor: { $in: [PaymentFor.PROVIDER_SUBSCRIPTION, PaymentFor.APPOINTMENT_BOOKING] } } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    totalRevenueViaSubscriptions: [
                        { $match: { paymentFor: PaymentFor.PROVIDER_SUBSCRIPTION } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    totalRevenueViaAppointments: [
                        { $match: { paymentFor: PaymentFor.APPOINTMENT_BOOKING } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    revenueByStripe: [
                        { $match: { paymentGateway: PaymentGateway.STRIPE } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    revenueByRazorpay: [
                        { $match: { paymentGateway: PaymentGateway.RAZORPAY } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    revenueByPaypal: [
                        { $match: { paymentGateway: PaymentGateway.PAYPAL } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    totalRefundsIssued: [
                        { $match: { paymentStatus: PaymentStatus.REFUNDED } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    totalFailedPayments: [
                        { $match: { paymentStatus: PaymentStatus.FAILED } },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: "$Count" }
                            }
                        }
                    ],
                    totalPayoutsToProviders: [
                        { $match: { PaymentFor: PaymentFor.PROVIDER_PAYOUT } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    totalRevenue: { $ifNull: [{ $arrayElemAt: ["$totalRevenue.amount", 0] }, 0] },
                    totalRevenueViaSubscriptions: { $ifNull: [{ $arrayElemAt: ["$totalRevenueViaSubscriptions.amount", 0] }, 0] },
                    revenueByStripe: { $ifNull: [{ $arrayElemAt: ["$revenueByStripe.amount", 0] }, 0] },
                    revenueByRazorpay: { $ifNull: [{ $arrayElemAt: ["$revenueByRazorpay.amount", 0] }, 0] },
                    revenueByPaypal: { $ifNull: [{ $arrayElemAt: ["$revenueByPaypal.amount", 0] }, 0] },
                    totalRevenueViaAppointments: { $ifNull: [{ $arrayElemAt: ["$totalRevenueViaAppointments.amount", 0] }, 0] },
                    totalRefundsIssued: { $ifNull: [{ $arrayElemAt: ["$totalRefundsIssued.amount", 0] }, 0] },
                    totalFailedPayments: { $ifNull: [{ $arrayElemAt: ["$totalFailedPayments.count", 0] }, 0] },
                    totalPayoutsToProviders: { $ifNull: [{ $arrayElemAt: ["$totalPayoutsToProviders.amount", 0] }, 0] },
                }
            }
        ]);

        const data = paymentData[0];
        return { ...data };
    };

    async findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardPaymentStatsDataResponse> {
        const today = startOfToday();
        const tomorrow = startOfTomorrow();

        const startOfThisMonth = startOfMonth(new Date());
        const endOfToday = endOfDay(new Date());

        const result = await PaymentModel.aggregate([
            {
                $match: {
                    providerId: new Types.ObjectId(providerId),
                    paymentStatus: PaymentStatus.PAID,
                }
            },
            {
                $facet: {
                    totalSubscriptionPaidAmount: [
                        { $match: { paymentFor: PaymentFor.PROVIDER_SUBSCRIPTION } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" },
                            }
                        }
                    ],
                    totalEarnings: [
                        {
                            $match: {
                                paymentFor: PaymentFor.APPOINTMENT_BOOKING
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                grossEarnings: { $sum: "$totalAmount" },
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                amount: {
                                    $multiply: ["$grossEarnings", 0.95],
                                }
                            }
                        }
                    ],
                    todaysEarnings: [
                        {
                            $match: {
                                paymentFor: PaymentFor.APPOINTMENT_BOOKING,
                                createdAt: { $gt: today, $lt: tomorrow },
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                grossEarnings: { $sum: "$totalAmount" },
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                amount: {
                                    $multiply: ["$grossEarnings", 0.95],
                                }
                            }
                        }
                    ],
                    totalPayoutsMade: [
                        {
                            $match: { paymentFor: PaymentFor.PROVIDER_PAYOUT }
                        },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" },
                            }
                        }
                    ],
                    pendingPayout: [
                        {
                            $match: {
                                paymentFor: PaymentFor.APPOINTMENT_BOOKING,
                                createdAt: { $gte: startOfThisMonth, $lte: endOfToday },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                grossEarnings: { $sum: "$totalAmount" },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                amount: {
                                    $multiply: ["$grossEarnings", 0.95],
                                },
                            },
                        },
                    ]
                }
            },
            {
                $project: {
                    totalSubscriptionPaidAmount: { $ifNull: [{ $arrayElemAt: ["$totalSubscriptionPaidAmount.amount", 0] }, 0] },
                    totalEarnings: { $ifNull: [{ $arrayElemAt: ["$totalEarnings.amount", 0] }, 0] },
                    todaysEarnings: { $ifNull: [{ $arrayElemAt: ["$todaysEarnings.amount", 0] }, 0] },
                    totalPayoutsMade: { $ifNull: [{ $arrayElemAt: ["$totalPayoutsMade.amount", 0] }, 0] },
                    pendingPayout: { $ifNull: [{ $arrayElemAt: ["$pendingPayout.amount", 0] }, 0] },
                }
            }
        ]);

        const data = result[0];
        return { ...data };
    };

}