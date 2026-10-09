import { IPaymentQueries } from "../../../interfaces/queries/IPayment.queries";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import {
  GetProviderRevenueStatsInput,
  GetProviderRevenueStatsOutput,
} from "../../../dtos/payment.dtos";

export class GetProviderRevenueStatsUseCase {
  constructor(private readonly paymentQueries: IPaymentQueries) {}

  async execute(input: GetProviderRevenueStatsInput): Promise<GetProviderRevenueStatsOutput> {
    try {
      return await this.paymentQueries.findStatsDataForProviderDashboard(input);
    } catch (error: unknown) {
      throw toAppError(error, "Failed to get provider revenue stats");
    }
  }
}
