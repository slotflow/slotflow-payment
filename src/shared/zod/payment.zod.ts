import { z } from "zod";
import { dateSchema, paginationSchema, validateProviderIdSchema } from "./base.zod";
import { PlanName } from "../../domain/enums/plan.enum";
import { PaymentFor } from "../../domain/enums/payment.enum";
import { descriptionRegex, objectIdRegex } from "../utils/regex";
import { SubscriptionValidity } from "../../domain/enums/subscription.enum";

export const providerSubscipriotonCheckoutSchema = z.object({
    subscriptionId: z.string().regex(objectIdRegex, "Invalid subscriptionId"),
    planName: z.nativeEnum(PlanName),
    description: z.string()
        .min(10, "Plan description must be at least 10 characters")
        .max(200, "Plan description must be at most 200 characters")
        .regex(descriptionRegex, "Invalid description. Contains unsupported characters."),
    planDuration: z.number().min(1).max(12),
    unitAmount: z.number()
        .min(0, "Plan price must be at least 0")
        .max(100000, "Plan price must be at most 100000"),
    paymentFor: z.nativeEnum(PaymentFor),
    paymentDate: dateSchema,
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    initialAmount: z.number()
        .min(0, "Initial amount must be at least 0")
        .max(100000, "Initial amount must be at most 100000"),
}).merge(validateProviderIdSchema);

//
export const getPaymentsSchema = z.object({
    userId: z.string().regex(objectIdRegex).optional(),
    providerId: z.string().regex(objectIdRegex).optional(),
}).merge(paginationSchema);

//
export const getPaymentDetailsSchema = z.object({
    paymentId: z.string().regex(objectIdRegex, "Invalid paymentId"),
});