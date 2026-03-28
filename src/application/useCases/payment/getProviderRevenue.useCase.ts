import { IPaymentQueries } from "../../queries/IPayment.queries";
import { GetProviderRevenueRequest, GetProviderRevenueResponse } from "../../dtos/payment.dtos";

export class GetProviderRevenueUseCase {
    constructor(
        private readonly paymentQueries: IPaymentQueries,
    ) { }

    async execute(payload: GetProviderRevenueRequest): Promise<GetProviderRevenueResponse> {
        return await this.paymentQueries.findStatsDataForProviderDashboard(payload);
    }
}