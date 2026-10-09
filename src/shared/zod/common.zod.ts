import z from "zod";
import { dateOnlySchema } from "./base.zod";

// validate email zod schema
export const validateEmailSchema = z.object({
  email: z.string().email("Invalid email"),
});

// start and end date zod schema
export const getRevenueStatsSchema = z.object({
  startDate: dateOnlySchema,
  endDate: dateOnlySchema,
});

export const getRevenueAnalyticsSchema = z.object({
  startDate: dateOnlySchema,
  endDate: dateOnlySchema,
});
