import { IPaymentQueries } from "../../queries/IPayment.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetProviderRevenueRequest, GetProviderRevenueResponse } from "../../dtos/payment.dtos";

export class GetProviderRevenueUseCase {
    constructor(
        private readonly paymentQueries: IPaymentQueries,
    ) { }

    async execute(payload: GetProviderRevenueRequest): Promise<GetProviderRevenueResponse> {
        try {
            return await this.paymentQueries.findStatsDataForProviderDashboard(payload);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get provider revenue");
        }
    }
}