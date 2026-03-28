import { TableData } from "../dtos/common.dtos";
import { GetAdminRevenueReportRequest, GetAdminRevenueReportResponse, GetAdminRevenueStatsDataRequest, GetAdminRevenueStatsDataResponse, GetProviderRevenueRequest, GetProviderRevenueResponse } from "../dtos/payment.dtos";

export interface IPaymentQueries {

    findStatsDataForProviderDashboard(payload: GetProviderRevenueRequest): Promise<GetProviderRevenueResponse>;

    findStatsDataForAdminDashboard(payload: GetAdminRevenueStatsDataRequest): Promise<GetAdminRevenueStatsDataResponse>;

    findAdminRevenueReport(payload: GetAdminRevenueReportRequest): Promise<TableData<GetAdminRevenueReportResponse>>;

};