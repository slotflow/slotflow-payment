import { IPaymentQueries } from "../../../interfaces/queries/IPayment.queries";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { GetAdminRevenueStatsInput, GetAdminRevenueStatsOutput } from "../../../dtos/payment.dtos";

export class GetAdminRevenueStatsUseCase {
    constructor(
        private readonly paymentQueries: IPaymentQueries,
    ) { };

    async execute(input: GetAdminRevenueStatsInput): Promise<GetAdminRevenueStatsOutput> {
        try {
            return await this.paymentQueries.findStatsDataForAdminDashboard(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get admin revenue stats");
        };
    };
}