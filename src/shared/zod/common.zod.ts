import z from "zod";

export const validateEmailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const startAndEndDateSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
});