import { TableData } from "../dtos/common.dtos";
import { GetAdminRevenueReportQuery, GetAdminRevenueReportView, GetAdminRevenueStatsDataQuery, GetAdminRevenueStatsDataView, GetProviderRevenueQuery, GetProviderRevenueView } from "../dtos/payment.dtos";

export interface IPaymentQueries {

    findStatsDataForProviderDashboard(query: GetProviderRevenueQuery): Promise<GetProviderRevenueView>;

    findStatsDataForAdminDashboard(query: GetAdminRevenueStatsDataQuery): Promise<GetAdminRevenueStatsDataView>;

    findAdminRevenueReport(query: GetAdminRevenueReportQuery): Promise<TableData<GetAdminRevenueReportView>>;

};