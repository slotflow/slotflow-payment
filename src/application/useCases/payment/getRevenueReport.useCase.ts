import { ApiResponse } from "../../dtos/common.dtos";
import { IPaymentQueries } from "../../queries/IPayment.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetAdminRevenueReportInput, GetAdminRevenueReportOutput } from "../../dtos/payment.dtos";

export class GetAdminRevenueReportUseCase {
    constructor(
        private paymentQueries: IPaymentQueries,
    ) { };

    async execute(input: GetAdminRevenueReportInput): Promise<ApiResponse<GetAdminRevenueReportOutput>> {
        try {
            const result = await this.paymentQueries.findAdminRevenueReport(input);
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