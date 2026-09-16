import { serviceConfig } from "../../../config/env";
import { Role } from "../../../domain/enums/common.enum";
import { BookingCheckoutInput } from "../../dtos/payment.dtos";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { CreateStripeCustomerUseCase } from "../stripe/createStripeCustomer.useCase";
import { bookingPaymentFailedUrl, bookingPaymentSuccessUrl } from "../../../shared/utils/constants";

export class BookingCheckoutUseCase {
    constructor(
        private readonly paymentGateway: IPaymentGateway,
        private readonly createStripeCustomer: CreateStripeCustomerUseCase
    ) { }

    async execute(input: BookingCheckoutInput): Promise<string> {
        try {
            const {
                serviceName,
                description,
                unitAmount,
                providerId,
                slotDuration,
                selectedServiceMode,
                bookingId,
                userId,
                paymentFor,
                userEmail,
                userName,
                pushNotification,
                stripeCustomerId
            } = input;

            if (!serviceName ||
                !description ||
                !unitAmount ||
                !providerId ||
                !slotDuration ||
                !selectedServiceMode ||
                !bookingId ||
                !userId ||
                !paymentFor ||
                !userEmail ||
                !userName
            ) {
                throw new BadRequestError();
            }

             let customerId: string | undefined = stripeCustomerId;

            if (!customerId) {
                const customer = await this.createStripeCustomer.execute({
                    email: userEmail,
                    username: userName,
                    userId: providerId,
                    role: Role.PROVIDER
                });

                customerId = customer.stripeCustomerId;
            }

            const result = await this.paymentGateway.createBookingCheckoutSession({
                serviceName,
                description,
                unitAmount,
                providerId,
                slotDuration,
                selectedServiceMode,
                bookingId,
                userId,
                paymentFor,
                userEmail,
                userName,
                stripeCustomerId: customerId,
                successUrl: serviceConfig.frontendUrl + bookingPaymentSuccessUrl,
                cancelUrl: serviceConfig.frontendUrl + bookingPaymentFailedUrl,
                pushNotification: pushNotification.toString(),
            });

            return result.sessionId;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to booking checkout");
        }
    }
}