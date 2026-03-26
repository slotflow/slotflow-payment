import { TableData } from "../dtos/common.dtos";
import { AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardTodayPaymentStatsDataResponse, GetAdminRevenueReportRequest, GetAdminRevenueReportResponse, ProviderFetchDashboardPaymentStatsDataResponse } from "../dtos/payment.dtos";

export interface IPaymentQueries {

    findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardPaymentStatsDataResponse>;

    findTodayStatsDataForAdminDashboard(): Promise<AdminFetchDashboardTodayPaymentStatsDataResponse>;

    findStatsDataForAdminDashboard(): Promise<AdminFetchDashboardRevenueStatsDataResponse>;

    findAdminRevenueReport(payload: GetAdminRevenueReportRequest): Promise<TableData<GetAdminRevenueReportResponse>>;

};