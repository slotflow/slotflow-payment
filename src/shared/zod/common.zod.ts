import z from "zod";

// validate email zod schema
export const validateEmailSchema = z.object({
    email: z.string().email("Invalid email"),
});

// start and end date zod schema
export const startAndEndDateSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
});