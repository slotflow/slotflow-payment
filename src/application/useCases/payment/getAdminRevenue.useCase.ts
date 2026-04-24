import { IPaymentQueries } from "../../queries/IPayment.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetAdminRevenueStatsDataRequest, GetAdminRevenueStatsDataResponse } from "../../dtos/payment.dtos";

export class GetAdminRevenueUseCase {
    constructor(
        private readonly paymentQueries: IPaymentQueries,
    ) { };

    async execute(payload: GetAdminRevenueStatsDataRequest): Promise<GetAdminRevenueStatsDataResponse> {
        try {
            return await this.paymentQueries.findStatsDataForAdminDashboard(payload);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get admin revenue");
        };
    };
}