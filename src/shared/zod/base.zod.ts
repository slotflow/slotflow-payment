import z from "zod";
import { parseDate } from "../utils/helpers/parseDate";
import { dateOnlyRegex, objectIdRegex } from "../utils/constants/regex";

// provider id validation zod schema
export const validateProviderIdSchema = z.object({
    providerId: z.string().regex(objectIdRegex, "Invalid providerId"),
});

// user id validation zod schema
export const validateUserIdSchema = z.object({
    providerId: z.string().regex(objectIdRegex, "Invalid providerId"),
});

/**
 * Date-Only String Schema ("YYYY-MM-DD")
 * Keeps date-only values as validated string primitives for calendar/timezone-aware filters.
 * Rejects invalid calendar dates (e.g., "2026-02-31").
 */
export const dateOnlySchema = z.string().refine(
  (val) => {
    if (!dateOnlyRegex.test(val)) return false;
    try {
      // Validate real calendar date (prevents rollover like Feb 31 -> March)
      const parsed = parseDate(val);
      return !isNaN(parsed.getTime());
    } catch {
      return false;
    }
  },
  { message: "Invalid calendar date format. Expected YYYY-MM-DD." }
);

export const dateTimeSchema = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") {
    return val; // Pass through to Zod so required/optional rules handle it cleanly
  }
  if (typeof val === "string" || typeof val === "number" || val instanceof Date) {
    try {
      return parseDate(val);
    } catch {
      return val; // Invalid parse returns original val to trigger Zod validation error
    }
  }
  return val;
}, z.date("Invalid datetime value provided."));

// Pagination zod schema with default values
export const paginationSchema = z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").max(100, "Page must be at most 100").optional().default(1),
    limit: z.coerce.number().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").optional().default(10),
});