import { calculateTrend } from "./calculateHelper";
import { StatMetric } from "../../application/dtos/common.dtos";

export const formatStatMetric = (current: number, previous: number): StatMetric => ({
  value: current,
  trend: calculateTrend(current, previous),
});