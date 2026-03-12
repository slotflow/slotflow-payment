import { serviceConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { BookingCheckoutRequest } from "../../dtos/payment.dtos";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { bookingPaymentFailedUrl, bookingPaymentSuccessUrl } from "../../../shared/utils/constants";

export class BookingCheckoutUseCase {
    constructor(
        private readonly paymentGateway: IPaymentGateway
    ) { }

    async execute(payload: BookingCheckoutRequest): Promise<string> {
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
                initialAmount,
                pushNotification,
            } = payload;

            console.log("successUrl : ",serviceConfig.frontendUrl + bookingPaymentSuccessUrl);
            console.log("failedUrl : ",serviceConfig.frontendUrl + bookingPaymentFailedUrl);

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
                initialAmount,
                successUrl: serviceConfig.frontendUrl + bookingPaymentSuccessUrl,
                cancelUrl: serviceConfig.frontendUrl + bookingPaymentFailedUrl,
                pushNotification: pushNotification.toString()
            });

            return result.sessionId;
        } catch (error) {
            log.error("BookingCheckoutUseCase failed : ", error as Error);
            throw error;
        }
    }
}