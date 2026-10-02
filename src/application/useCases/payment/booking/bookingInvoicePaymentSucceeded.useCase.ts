import Stripe from "stripe";
import { kafkaConfig } from "../../../../config/env";
import { BookingMetaData } from "../../../dtos/payment.dtos";
import { Payment } from "../../../../domain/entities/payment.entity";
import { generateId } from "../../../../shared/utils/helpers/generateId";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { ERROR_CODES, IdType } from "../../../../shared/utils/types/enums";
import { AppError, BadRequestError } from "../../../../shared/error/appError";
import { dateFormats, notificationType } from "../../../../shared/utils/constants/constants";
import { CreateBookingPaymentSuccessEvent, EventEnvelope } from "../../../dtos/kafka.dtos";
import { IKafkaProducerAdapter } from "../../../interfaces/messaging/IKafkaProducer.adapter";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../../../../domain/enums/payment.enum";
import { IPaymentRepository } from "../../../../domain/interfaces/repositories/IPayment.repository";
import { formatDate } from "../../../../shared/utils/helpers/formatDate";

export class BookingInvoicePaymentSucceededUseCase {

    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
    ) { }

    async execute(invoice: Stripe.Invoice): Promise<void> {
        try {
            if (!invoice) {
                throw new BadRequestError("Invoice object missing");
            }

            console.log("invoice : ",invoice);

            const metaData: Stripe.Metadata | BookingMetaData | undefined | null = invoice?.parent?.subscription_details?.metadata || invoice?.metadata;

            const idempotencyKey: string = generateId(IdType.IDEMPOTENCY);
            const transactionId: string = generateId(IdType.TRANSACTION);
            const stripeInvoiceId: string = invoice.id as string;

            const paymentStatus: PaymentStatus = invoice?.status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING;
            const paymentGateway: PaymentGateway = PaymentGateway.STRIPE;
            const paymentFor: PaymentFor = (metaData?.paymentFor as PaymentFor) || PaymentFor.APPOINTMENT_BOOKING;

            const subtotalAmount: number = invoice.subtotal;
            const discountAmount: number = 0;
            const totalAmount: number = invoice.total;
            const currency: string = invoice.currency;

            const userId: string = metaData?.userId as string;
            const providerId: string = metaData?.providerId as string;
            const slotflowBookingId: string = metaData?.bookingId as string;

            const stripeCustomerId: string = invoice.customer as string;

            const gatewayFee: number = 0;
            const receiptUrl: string = invoice.hosted_invoice_url as string;
            const receiptPdf: string = invoice.invoice_pdf as string;

            const customerEmail: string = invoice.customer_email || (metaData?.userEmail as string);
            const customerName: string = invoice?.customer_name || (metaData?.userName as string);
            const description: string = invoice.billing_reason as string;

            const paidAt: Date = new Date(invoice.created * 1000);

            if (
                !idempotencyKey ||
                !transactionId ||
                !stripeInvoiceId ||
                !paymentStatus ||
                !paymentGateway ||
                !paymentFor ||
                subtotalAmount === undefined ||
                discountAmount === undefined ||
                totalAmount === undefined ||
                !currency ||
                !receiptUrl ||
                !customerEmail ||
                !paidAt
            ) {
                throw new BadRequestError("Missing required payment fields");
            }

            const paymentData = Payment.createForBooking({
                idempotencyKey,
                transactionId,
                stripeInvoiceId,

                paymentStatus,
                paymentGateway,
                paymentFor,

                slotflowBookingId,

                subtotalAmount,
                discountAmount,
                totalAmount,
                currency,

                userId,
                providerId,

                stripeCustomerId,

                gatewayFee,
                receiptUrl,
                receiptPdf,

                customerEmail,
                customerName,
                description,

                paidAt,
            });

            console.log("paymentData : ",paymentData);

            const payment = await this.paymentRepository.create(paymentData);

            console.log("payment : ",payment);

            if (payment) {
                await this.kafkaProducer.publish<EventEnvelope<CreateBookingPaymentSuccessEvent>>(
                    kafkaConfig.topics.pub.userBookingPaymentSuccess,
                    {
                        eventId: generateId(IdType.EVENT),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toString(),
                        payload: {
                            mbsData: {
                                bookingId: slotflowBookingId,
                                paymentId: payment._id,
                            },
                            emailData: {
                                email: customerEmail,
                                name: customerName,
                                totalAmount,
                                paymentDate: formatDate(payment.createdAt, dateFormats.WITH_TIME),
                                receiptUrl,
                                transactionId: payment.transactionId,
                            },
                            notificationData: {
                                userId,
                                transactionId: payment.transactionId,
                                notificationType: notificationType.ACCOUNT_ACTIVITY
                            },
                        },
                    }
                );
            } else {
                throw new AppError(
                    "Failed to create payment",
                    500,
                    false,
                    ERROR_CODES.PAYMENT_SERVICE_ERROR
                )
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to complete booking payment");
        }
    }
}