import { AdminFetchDashboardRevenueStatsDataRequest, AdminFetchDashboardRevenueStatsDataResponse } from "../../dtos/payment.dtos";
import { IPaymentQueries } from "../../queries/IPayment.queries";

export class GetAdminRevenueUseCase {
    constructor(
        private readonly paymentQueries: IPaymentQueries,
    ) { };

    async execute(payload: AdminFetchDashboardRevenueStatsDataRequest): Promise<AdminFetchDashboardRevenueStatsDataResponse> {
        try {
            return await this.paymentQueries.findStatsDataForAdminDashboard(payload);
        } catch (error) {
            throw error;
        };
    };
}