import Stripe from "stripe";
import { kafkaConfig } from "../../../../config/env.ts";
import { SubscriptionMetaData } from "../../../dtos/payment.dtos.ts";
import { Payment } from "../../../../domain/entities/payment.entity.ts";
import { toAppError } from "../../../../shared/error/handleUnknownError.ts";
import { generateId } from "../../../../shared/utils/helpers/generateId.ts";
import { ERROR_CODES, IdType } from "../../../../shared/utils/types/enums.ts";
import { AppError, BadRequestError } from "../../../../shared/error/appError.ts";
import { dateFormats } from "../../../../shared/utils/constants/constants.ts";
import { IPaymentGateway } from "../../../interfaces/payment/IPaymentGateway.service.ts";
import { IKafkaProducerAdapter } from "../../../interfaces/messaging/IKafkaProducer.adapter.ts";
import { EventEnvelope, ProviderSubscriptionPaymentSuccessEvent } from "../../../dtos/kafka.dtos.ts";
import { IPaymentRepository } from "../../../../domain/interfaces/repositories/IPayment.repository.ts";
import { BillingCycle, PaymentFor, PaymentGateway, PaymentStatus } from "../../../../domain/enums/payment.enum.ts";
import { formatDate } from "../../../../shared/utils/helpers/formatDate.ts";
import { NotificationType } from "../../../../domain/enums/common.enum.ts";

export class SubscriptionInvoicePaymentSucceededUseCase {

    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly paymentGateway: IPaymentGateway,
    ) { };

    async execute(invoice: Stripe.Invoice): Promise<void> {
        try {

            if (!invoice) {
                throw new BadRequestError();
            }

            const metaData: Stripe.Metadata | SubscriptionMetaData | undefined | null = invoice?.parent?.subscription_details?.metadata;

            const idempotencyKey: string = generateId(IdType.IDEMPOTENCY);
            const transactionId: string = generateId(IdType.TRANSACTION);
            const stripeInvoiceId: string = invoice.id as string;

            const paymentStatus: PaymentStatus = invoice?.status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING;
            const paymentGateway: PaymentGateway = PaymentGateway.STRIPE;
            const paymentFor: PaymentFor = metaData?.paymentFor as PaymentFor || PaymentFor.PROVIDER_SUBSCRIPTION;

            const slotflowSubscriptionId: string = metaData?.subscriptionId as string;

            const subtotalAmount: number = invoice.subtotal / 100;
            const discountAmount: number = 0;
            const totalAmount: number = invoice.total / 100;
            const currency: string = invoice.currency;
            const billingCycle: BillingCycle = metaData?.billingCycle as BillingCycle;

            const userId: string = metaData?.userId as string;

            const stripeCustomerId: string = invoice.customer as string;
            const stripeSubscriptionId: string = invoice?.parent?.subscription_details?.subscription as string;

            const gatewayFee: number = 0;
            const receiptUrl: string = invoice.hosted_invoice_url as string;
            const receiptPdf: string = invoice.invoice_pdf as string;

            const customerEmail: string = invoice.customer_email || metaData?.userName as string;
            const customerName: string = invoice?.customer_name || metaData?.userEmail as string;
            const description: string = invoice.billing_reason as string;

            const paidAt: Date = new Date(invoice.created * 1000);

            const isTrial: boolean = metaData?.isTrial === "true";

            let currentPeriodStart: Date = new Date(invoice.period_start * 1000);
            let currentPeriodEnd: Date = new Date(invoice.period_end * 1000);
            let stripeSubscription: Stripe.Subscription | null = null;

            let cancelAtPeriodEnd: boolean = false;
            let cancelAt: Date | null = null;
            let lastEventAt: Date = new Date();

            if (stripeSubscriptionId) {
                stripeSubscription = await this.paymentGateway.getSubscription(stripeSubscriptionId);
            }

            if (stripeSubscription) {
                const primaryItem = stripeSubscription.items.data[0];

                currentPeriodStart = primaryItem?.current_period_start
                    ? new Date(primaryItem.current_period_start * 1000)
                    : new Date();

                currentPeriodEnd = primaryItem?.current_period_end
                    ? new Date(primaryItem.current_period_end * 1000)
                    : new Date();

                cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

                cancelAt = stripeSubscription.cancel_at
                    ? new Date(stripeSubscription.cancel_at * 1000)
                    : null;

                lastEventAt = stripeSubscription.created
                    ? new Date(stripeSubscription.created * 1000)
                    : new Date();
            }

            if (
                !idempotencyKey ||
                !transactionId ||
                !stripeInvoiceId ||
                !paymentStatus ||
                !paymentGateway ||
                !paymentFor ||
                !userId ||
                subtotalAmount === undefined ||
                totalAmount === undefined ||
                !currency ||
                !receiptUrl ||
                !customerEmail ||
                !paidAt
            ) {
                throw new BadRequestError();
            }

            const paymentData = Payment.createForSubscription({
                idempotencyKey,
                transactionId,
                stripeInvoiceId,

                paymentStatus,
                paymentGateway,
                paymentFor,

                slotflowSubscriptionId,

                subtotalAmount,
                discountAmount,
                totalAmount,
                currency,
                billingCycle,

                userId,

                stripeCustomerId,
                stripeSubscriptionId,

                gatewayFee,
                receiptUrl,
                receiptPdf,

                customerEmail,
                customerName,
                description,

                paidAt,
            });

            const payment = await this.paymentRepository.create(paymentData);
            if (payment && payment.paymentStatus === PaymentStatus.PAID) {
                await this.kafkaProducer.publish<EventEnvelope<ProviderSubscriptionPaymentSuccessEvent>>(
                    kafkaConfig.topics.pub.providerSubscriptionPaymentSuccess,
                    {
                        eventId: generateId(IdType.EVENT),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toString(),
                        payload: {
                            mbsData: {
                                subscriptionId: slotflowSubscriptionId,
                                paymentId: payment._id,
                                providerId: userId,
                                isTrial: String(isTrial),
                                currentPeriodStart,
                                currentPeriodEnd,
                                cancelAtPeriodEnd,
                                cancelAt,
                                lastEventAt,
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
                                notificationType: NotificationType.ACCOUNT_ACTIVITY
                            },
                        },
                    },
                )
            } else {
                throw new AppError(
                    "Failed to create payment",
                    500,
                    false,
                    ERROR_CODES.PAYMENT_SERVICE_ERROR
                )
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to complete subscription");
        };
    };
};