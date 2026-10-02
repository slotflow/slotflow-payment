import { Types } from "mongoose";
import { PaymentModel } from "../models/payment.model";
import { TableData } from "../../application/dtos/common.dtos";
import { PaymentFor, PaymentStatus } from "../../domain/enums/payment.enum";
import { formatStatMetric } from "../../shared/utils/helpers/formatStatMetric";
import { IPaymentQueries } from "../../application/interfaces/queries/IPayment.queries";
import { getDateRangeMetrics } from "../../shared/utils/helpers/getDateRangeMetrics";
import { GetAdminRevenueAanalyticsQuery, GetAdminRevenueAanalyticsView, GetAdminRevenueReportQuery, GetAdminRevenueReportView, GetAdminRevenueStatsDataQuery, GetAdminRevenueStatsDataView, GetProviderRevenueQuery, GetProviderRevenueView } from "../../application/dtos/payment.dtos";

export class PaymentQueriesImpl implements IPaymentQueries {

    async findAdminRevenueReport(query: GetAdminRevenueReportQuery): Promise<TableData<GetAdminRevenueReportView>> {
        const { endDate, limit, page, startDate, timeZone } = query;

        const { start, end } = getDateRangeMetrics({
            startDate,
            endDate,
            timeZone,
        });

        const skip = (page - 1) * limit;
        const match: Record<string, any> = {
            paymentStatus: PaymentStatus.PAID,
            paymentFor: { $in: [PaymentFor.PROVIDER_SUBSCRIPTION, PaymentFor.APPOINTMENT_BOOKING] },
        };

        if (start || end) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = start;
            if (endDate) match.createdAt.$lte = end;
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
            items: {
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

    async findStatsDataForAdminDashboard(query: GetAdminRevenueStatsDataQuery): Promise<GetAdminRevenueStatsDataView> {
        const { timeZone, startDate, endDate } = query;

        const { start, end, prevStart, prevEnd } = getDateRangeMetrics({
            startDate,
            endDate,
            timeZone,
        });

        const [paymentData] = await PaymentModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: prevStart,
                        $lte: end,
                    },
                },
            },
            {
                $facet: {
                    current: [
                        { $match: { createdAt: { $gte: start, $lte: end } } },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $in: ["$paymentFor", [PaymentFor.PROVIDER_SUBSCRIPTION, PaymentFor.APPOINTMENT_BOOKING]] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                totalRevenueViaSubscriptions: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentFor", PaymentFor.PROVIDER_SUBSCRIPTION] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                totalRevenueViaAppointments: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentFor", PaymentFor.APPOINTMENT_BOOKING] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                totalRefundsIssued: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$paymentStatus", PaymentStatus.REFUNDED] },
                                            { $ifNull: ["$refundedAmount", "$totalAmount"] },
                                            0
                                        ]
                                    }
                                },
                                totalFailedPayments: {
                                    $sum: {
                                        $cond: [{ $eq: ["$paymentStatus", PaymentStatus.FAILED] }, 1, 0]
                                    }
                                },
                                totalPayoutsToProviders: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$paymentFor", PaymentFor.PROVIDER_PAYOUT] },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    previous: [
                        { $match: { createdAt: { $gte: prevStart, $lte: prevEnd } } },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $in: ["$paymentFor", [PaymentFor.PROVIDER_SUBSCRIPTION, PaymentFor.APPOINTMENT_BOOKING]] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                totalRevenueViaSubscriptions: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentFor", PaymentFor.PROVIDER_SUBSCRIPTION] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                totalRevenueViaAppointments: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentFor", PaymentFor.APPOINTMENT_BOOKING] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                totalRefundsIssued: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$paymentStatus", PaymentStatus.REFUNDED] },
                                            { $ifNull: ["$refundedAmount", "$totalAmount"] },
                                            0
                                        ]
                                    }
                                },
                                totalFailedPayments: {
                                    $sum: {
                                        $cond: [{ $eq: ["$paymentStatus", PaymentStatus.FAILED] }, 1, 0]
                                    }
                                },
                                totalPayoutsToProviders: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$paymentFor", PaymentFor.PROVIDER_PAYOUT] },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const defaultStats = {
            totalRevenue: 0,
            totalRevenueViaSubscriptions: 0,
            totalRevenueViaAppointments: 0,
            totalRefundsIssued: 0,
            totalFailedPayments: 0,
            totalPayoutsToProviders: 0,
        };

        const current = paymentData?.current[0] || defaultStats;
        const previous = paymentData?.previous[0] || defaultStats;

        return {
            totalRevenue: formatStatMetric(current.totalRevenue, previous.totalRevenue),
            totalRevenueViaSubscriptions: formatStatMetric(current.totalRevenueViaSubscriptions, previous.totalRevenueViaSubscriptions),
            totalRevenueViaAppointments: formatStatMetric(current.totalRevenueViaAppointments, previous.totalRevenueViaAppointments),
            totalRefundsIssued: formatStatMetric(current.totalRefundsIssued, previous.totalRefundsIssued),
            totalFailedPayments: formatStatMetric(current.totalFailedPayments, previous.totalFailedPayments),
            totalPayoutsToProviders: formatStatMetric(current.totalPayoutsToProviders, previous.totalPayoutsToProviders),
        };
    }

    async findStatsDataForProviderDashboard(query: GetProviderRevenueQuery): Promise<GetProviderRevenueView> {
        const { providerId, startDate, endDate, timeZone } = query;

        const { start, end, prevStart, prevEnd } = getDateRangeMetrics({
            startDate,
            endDate,
            timeZone,
        });

        const [paymentData] = await PaymentModel.aggregate([
            {
                $match: {
                    providerId: new Types.ObjectId(providerId),
                    createdAt: {
                        $gte: prevStart,
                        $lte: end,
                    },
                },
            },
            {
                $facet: {
                    current: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: start,
                                    $lte: end,
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,

                                totalSubscriptionPaidAmount: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$paymentStatus",
                                                            PaymentStatus.PAID,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            "$paymentFor",
                                                            PaymentFor.PROVIDER_SUBSCRIPTION,
                                                        ],
                                                    },
                                                ],
                                            },
                                            "$totalAmount",
                                            0,
                                        ],
                                    },
                                },

                                grossEarnings: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$paymentStatus",
                                                            PaymentStatus.PAID,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            "$paymentFor",
                                                            PaymentFor.APPOINTMENT_BOOKING,
                                                        ],
                                                    },
                                                ],
                                            },
                                            "$totalAmount",
                                            0,
                                        ],
                                    },
                                },

                                totalPayoutsMade: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$paymentStatus",
                                                            PaymentStatus.PAID,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            "$paymentFor",
                                                            PaymentFor.PROVIDER_PAYOUT,
                                                        ],
                                                    },
                                                ],
                                            },
                                            "$totalAmount",
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,

                                totalSubscriptionPaidAmount: 1,

                                totalEarnings: {
                                    $multiply: ["$grossEarnings", 0.95],
                                },

                                totalPayoutsMade: 1,

                                pendingPayout: {
                                    $subtract: [
                                        {
                                            $multiply: ["$grossEarnings", 0.95],
                                        },
                                        "$totalPayoutsMade",
                                    ],
                                },
                            },
                        },
                    ],

                    previous: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: prevStart,
                                    $lte: prevEnd,
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,

                                totalSubscriptionPaidAmount: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$paymentStatus",
                                                            PaymentStatus.PAID,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            "$paymentFor",
                                                            PaymentFor.PROVIDER_SUBSCRIPTION,
                                                        ],
                                                    },
                                                ],
                                            },
                                            "$totalAmount",
                                            0,
                                        ],
                                    },
                                },

                                grossEarnings: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$paymentStatus",
                                                            PaymentStatus.PAID,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            "$paymentFor",
                                                            PaymentFor.APPOINTMENT_BOOKING,
                                                        ],
                                                    },
                                                ],
                                            },
                                            "$totalAmount",
                                            0,
                                        ],
                                    },
                                },

                                totalPayoutsMade: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$paymentStatus",
                                                            PaymentStatus.PAID,
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            "$paymentFor",
                                                            PaymentFor.PROVIDER_PAYOUT,
                                                        ],
                                                    },
                                                ],
                                            },
                                            "$totalAmount",
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,

                                totalSubscriptionPaidAmount: 1,
                                totalEarnings: { $multiply: ["$grossEarnings", 0.95] },
                                totalPayoutsMade: 1,
                                pendingPayout: {
                                    $subtract: [
                                        {
                                            $multiply: ["$grossEarnings", 0.95],
                                        },
                                        "$totalPayoutsMade",
                                    ],
                                },
                            },
                        },
                    ],
                },
            },
        ]);

        const defaultStats = {
            totalSubscriptionPaidAmount: 0,
            totalEarnings: 0,
            totalPayoutsMade: 0,
            pendingPayout: 0,
        };

        const current = paymentData?.current?.[0] ?? defaultStats;
        const previous = paymentData?.previous?.[0] ?? defaultStats;

        return {
            totalSubscriptionPaidAmount: formatStatMetric(current.totalSubscriptionPaidAmount, previous.totalSubscriptionPaidAmount),
            totalEarnings: formatStatMetric(current.totalEarnings, previous.totalEarnings),
            totalPayoutsMade: formatStatMetric(current.totalPayoutsMade, previous.totalPayoutsMade),
            pendingPayout: formatStatMetric(current.pendingPayout, previous.pendingPayout),
        };
    }

    async findAnalyticsForAdminDashboard(query: GetAdminRevenueAanalyticsQuery): Promise<GetAdminRevenueAanalyticsView> {
        const { timeZone, startDate, endDate } = query;

        const { start, end } = getDateRangeMetrics({
            startDate,
            endDate,
            timeZone,
        });

        const result = await PaymentModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    paymentStatus: { $in: [PaymentStatus.PAID, PaymentStatus.REFUNDED] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalRefunds: { $sum: "$refundedAmount" },
                    netRevenue: { $sum: { $subtract: ["$totalAmount", "$refundedAmount"] } },
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalRevenue: 1,
                    totalRefunds: 1,
                    netRevenue: 1,
                }
            }
        ]);
        return result;
    }
}