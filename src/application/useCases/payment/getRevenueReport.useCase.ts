import { TableData } from "../../dtos/common.dtos";
import { IPaymentQueries } from "../../interfaces/queries/IPayment.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetAdminRevenueReportInput, GetAdminRevenueReportOutput } from "../../dtos/payment.dtos";

export class GetAdminRevenueReportUseCase {
    constructor(
        private paymentQueries: IPaymentQueries,
    ) { };

    async execute(input: GetAdminRevenueReportInput): Promise<TableData<GetAdminRevenueReportOutput>> {
        try {
            return await this.paymentQueries.findAdminRevenueReport(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get admin revenue report");
        };
    };
};