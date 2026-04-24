import { ApiResponse } from "../../dtos/common.dtos";
import { IPaymentQueries } from "../../queries/IPayment.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
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
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get admin revenue report");
        };
    };
};