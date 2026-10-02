import { IPaymentQueries } from "../../../interfaces/queries/IPayment.queries";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { GetAdminRevenueAnalyticsInput, GetAdminRevenueAnalyticsOutput } from "../../../dtos/payment.dtos";

export class GetAdminRevenueAanalyticsUseCase {
    constructor(
        private readonly paymentQueries: IPaymentQueries,
    ) { };

    async execute(input: GetAdminRevenueAnalyticsInput): Promise<GetAdminRevenueAnalyticsOutput> {
        try {
            return await this.paymentQueries.findAnalyticsForAdminDashboard(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get admin revenue anakytics");
        };
    };
}