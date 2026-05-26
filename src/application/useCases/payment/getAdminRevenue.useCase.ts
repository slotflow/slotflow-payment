import { IPaymentQueries } from "../../queries/IPayment.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetAdminRevenueStatsDataInput, GetAdminRevenueStatsDataOutput } from "../../dtos/payment.dtos";

export class GetAdminRevenueUseCase {
    constructor(
        private readonly paymentQueries: IPaymentQueries,
    ) { };

    async execute(input: GetAdminRevenueStatsDataInput): Promise<GetAdminRevenueStatsDataOutput> {
        try {
            return await this.paymentQueries.findStatsDataForAdminDashboard(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get admin revenue");
        };
    };
}