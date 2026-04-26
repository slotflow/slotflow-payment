import { IPaymentQueries } from "../../queries/IPayment.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetProviderRevenueInput, GetProviderRevenueOutput } from "../../dtos/payment.dtos";

export class GetProviderRevenueUseCase {
    constructor(
        private readonly paymentQueries: IPaymentQueries,
    ) { }

    async execute(input: GetProviderRevenueInput): Promise<GetProviderRevenueOutput> {
        try {
            return await this.paymentQueries.findStatsDataForProviderDashboard(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get provider revenue");
        }
    }
}