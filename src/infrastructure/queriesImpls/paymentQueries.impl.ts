import { Types } from "mongoose";
import { PaymentModel } from "../models/payment.model";
import { TableData } from "../../application/dtos/common.dtos";
import { getStartAndEndDate } from "../../shared/utils/dateTime";
import { IPaymentQueries } from "../../application/queries/IPayment.queries";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../../domain/enums/payment.enum";
import { GetAdminRevenueReportQuery, GetAdminRevenueReportView, GetAdminRevenueStatsDataQuery, GetAdminRevenueStatsDataView, GetProviderRevenueQuery, GetProviderRevenueView } from "../../application/dtos/payment.dtos";
import { calculatePreviousPeriod } from "../../shared/utils/calculatePreviosPeriod";
import { formatStatMetric } from "../../shared/utils/formatStatMetric";

export class PaymentQueriesImpl implements IPaymentQueries {

    async findAdminRevenueReport(query: GetAdminRevenueReportQuery): Promise<TableData<GetAdminRevenueReportView>> {
        const { endDate, limit, page, startDate } = query;
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
        const { startDate, endDate } = getStartAndEndDate(query.startDate, query.endDate);
        const { previousStartDate, previousEndDate } = calculatePreviousPeriod(startDate, endDate);

        const [paymentData] = await PaymentModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: previousStartDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $facet: {
                    current: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
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
                                revenueByStripe: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentGateway", PaymentGateway.STRIPE] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                revenueByRazorpay: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentGateway", PaymentGateway.RAZORPAY] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                revenueByPaypal: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentGateway", PaymentGateway.PAYPAL] }
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
                        { $match: { createdAt: { $gte: previousStartDate, $lte: previousEndDate } } },
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
                                revenueByStripe: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentGateway", PaymentGateway.STRIPE] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                revenueByRazorpay: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentGateway", PaymentGateway.RAZORPAY] }
                                                ]
                                            },
                                            "$totalAmount",
                                            0
                                        ]
                                    }
                                },
                                revenueByPaypal: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                                                    { $eq: ["$paymentGateway", PaymentGateway.PAYPAL] }
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
            revenueByStripe: 0,
            revenueByRazorpay: 0,
            revenueByPaypal: 0,
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
            revenueByStripe: formatStatMetric(current.revenueByStripe, previous.revenueByStripe),
            revenueByRazorpay: formatStatMetric(current.revenueByRazorpay, previous.revenueByRazorpay),
            revenueByPaypal: formatStatMetric(current.revenueByPaypal, previous.revenueByPaypal),
            totalRefundsIssued: formatStatMetric(current.totalRefundsIssued, previous.totalRefundsIssued),
            totalFailedPayments: formatStatMetric(current.totalFailedPayments, previous.totalFailedPayments),
            totalPayoutsToProviders: formatStatMetric(current.totalPayoutsToProviders, previous.totalPayoutsToProviders),
        };
    }

    async findStatsDataForProviderDashboard(query: GetProviderRevenueQuery): Promise<GetProviderRevenueView> {
        const { providerId } = query;
        const { startDate, endDate } = getStartAndEndDate(query.startDate, query.endDate);

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
                                createdAt: { $gte: startDate, $lte: endDate },
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
                    totalPayoutsMade: { $ifNull: [{ $arrayElemAt: ["$totalPayoutsMade.amount", 0] }, 0] },
                    pendingPayout: { $ifNull: [{ $arrayElemAt: ["$pendingPayout.amount", 0] }, 0] },
                }
            }
        ]);

        const data = result[0];
        return { ...data };
    };

}