import { z } from "zod";
import { PlanName } from "../../domain/enums/plan.enum";
import { PaymentFor } from "../../domain/enums/payment.enum";
import { ServiceMode } from "../../domain/enums/service.enums";
import { dateSchema, paginationSchema, validateProviderIdSchema } from "./base.zod";
import { descriptionRegex, objectIdRegex, serviceDescriptionRegex, serviceNameRegex, usernameRegex } from "../utils/regex";

//
export const subscipriotonCheckoutSchema = z.object({
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
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    initialAmount: z.number()
        .min(0, "Initial amount must be at least 0")
        .max(100000, "Initial amount must be at most 100000"),
}).merge(validateProviderIdSchema);

//
export const bookingCheckoutShcema = z.object({
    serviceName: z.string()
        .min(4, "Service name must be at least 4 characters")
        .max(50, "Service name cannot exceed 50 characters")
        .regex(
            serviceNameRegex,
            "Invalid service name. Only alphabets and spaces are allowed (4–50 characters)."
        ),
    description: z
        .string()
        .min(10, "Service description must be at least 10 characters")
        .max(500, "Service description cannot exceed 500 characters")
        .regex(
            serviceDescriptionRegex,
            "Invalid service description. Only alphanumeric characters, spaces, and symbols are allowed (10–500 characters)."
        ),
    unitAmount: z.number().min(1).max(1000000),
    providerId: z.string().regex(objectIdRegex, "Invalid providerId"),
    slotDuration: z.number().min(10).max(480),
    appointmentDate: z.string(),
    selectedServiceMode: z.enum(ServiceMode),
    bookingId: z.string().regex(objectIdRegex, "Invalid bookingId"),
    userId: z.string().regex(objectIdRegex, "Invalid userId"),
    paymentFor: z.enum(PaymentFor),
    userEmail: z.string().email("Invalid email address"),
    userName: z
        .string()
        .min(4, "Username must be at least 4 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(usernameRegex, "Invalid Username format"),
    initialAmount: z.number().min(1).max(1000000),
    pushNotification: z.boolean(),
})

//
export const getPaymentsSchema = z.object({
    userId: z.string().regex(objectIdRegex).optional(),
    providerId: z.string().regex(objectIdRegex).optional(),
}).merge(paginationSchema);

//
export const getPaymentDetailsSchema = z.object({
    paymentId: z.string().regex(objectIdRegex, "Invalid paymentId"),
});