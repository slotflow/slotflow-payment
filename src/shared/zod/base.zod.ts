import z from "zod";
import { objectIdRegex } from "../utils/regex";

// provider id validation schema
export const validateProviderIdSchema = z.object({
    providerId: z.string().regex(objectIdRegex, "Invalid providerId"),
});

// user id validation schema
export const validateUserIdSchema = z.object({
    providerId: z.string().regex(objectIdRegex, "Invalid providerId"),
});

// Date validation schema
export const dateSchema = z.preprocess(
    (val) => {
        if (typeof val === "string" || val instanceof String) {
            const parsed = new Date(val as string);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        return val;
    },
    z.date()
);

// Pagination zod schema with default values
export const paginationSchema = z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").max(100, "Page must be at most 100").optional().default(1),
    limit: z.coerce.number().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").optional().default(10),
});