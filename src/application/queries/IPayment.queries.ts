import { TableData } from "../dtos/common.dtos";
import { ProviderFetchDashboardPaymentStatsDataResponse } from "../dtos/payment.dtos";
import { AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardTodayPaymentStatsDataResponse, AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../dtos/admin.dto";

export interface IPaymentQueries {

    findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardPaymentStatsDataResponse>;

    findTodayStatsDataForAdminDashboard(): Promise<AdminFetchDashboardTodayPaymentStatsDataResponse>;

    findStatsDataForAdminDashboard(): Promise<AdminFetchDashboardRevenueStatsDataResponse>;

    findAdminRevenueReport(payload: AdminFetchRevenueReportRequest): Promise<TableData<AdminFetchRevenueReportResponse>>;
    
};