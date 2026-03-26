import { log } from "../../../shared/logger/logger";
import { ApiResponse } from "../../dtos/common.dtos";
import { IPaymentQueries } from "../../queries/IPayment.queries";
import { GetAdminRevenueReportRequest, GetAdminRevenueReportResponse } from "../../dtos/payment.dtos";

export class GetAdminRevenueReportUseCase {
    constructor(
        private paymentQueries: IPaymentQueries,
    ) { };

    async execute(payload: GetAdminRevenueReportRequest): Promise<ApiResponse<GetAdminRevenueReportResponse>> {
        try {
            const result = await this.paymentQueries.findAdminRevenueReport(payload);
            const { data: report, totalPages, currentPage, totalCount } = result;
            return {
                data: report,
                totalPages,
                currentPage,
                totalCount
            };
        } catch (error) {
            log.error("GetRevenueReportUseCase failed", error as Error);
            throw error;
        };
    };
};