import { TableData } from "../dtos/common.dtos";
import { AdminFetchDashboardRevenueStatsDataRequest, AdminFetchDashboardRevenueStatsDataResponse, GetAdminRevenueReportRequest, GetAdminRevenueReportResponse, ProviderFetchDashboardPaymentStatsDataResponse } from "../dtos/payment.dtos";

export interface IPaymentQueries {

    findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardPaymentStatsDataResponse>;

    findStatsDataForAdminDashboard(payload: AdminFetchDashboardRevenueStatsDataRequest): Promise<AdminFetchDashboardRevenueStatsDataResponse>;

    findAdminRevenueReport(payload: GetAdminRevenueReportRequest): Promise<TableData<GetAdminRevenueReportResponse>>;

};