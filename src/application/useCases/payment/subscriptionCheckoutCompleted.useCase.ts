import Stripe from "stripe";
import { kafkaConfig } from "../../../config/env";
import { generateId } from "../../../shared/utils/generateId";
import { ERROR_CODES, IdType } from "../../../shared/utils/types";
import { Payment } from "../../../domain/entities/payment.entity";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { notificationContentMap } from "../../../shared/utils/constants";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { EventEnvelope, ProviderCreatePaymentSuccessEvent } from "../../dtos/kafka.dtos";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { PaymentFor, PaymentGateway, PaymentMethod, PaymentStatus } from "../../../domain/enums/payment.enum";

export class SubscriptionCheckoutCompleteUseCase {

    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly paymentGateway: IPaymentGateway,
    ) { };

    async execute(input: Stripe.Checkout.Session): Promise<void> {
        try {

            if (!input) {
                throw new BadRequestError();
            }

            console.log("input : ", input);

            const subscriptionId = input?.metadata?.subscriptionId;
            const providerId = input?.metadata?.userId;
            const paymentFor = input?.metadata?.paymentFor as PaymentFor;
            const name = input?.metadata?.userName;
            const email = input?.metadata?.userEmail;
            const isTrial = input?.metadata?.isTrial === "true";
            const planName = input?.metadata?.planName;

            if (!email || !name || !paymentFor || !subscriptionId || !planName) {
                throw new BadRequestError("Missing required subscription metadata");
            }

            if (!providerId) {
                throw new BadRequestError("Provider ID must be provided");
            }

            const paymentStatus = input?.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING;
            const paymentMethod = (input?.payment_method_types?.[0] as PaymentMethod) || PaymentMethod.CARD;
            const totalAmount = (input.amount_total || 0) / 100;
            const discountAmount = (input.total_details?.amount_discount || 0) / 100;
            const customerId = input.customer as string;

            let fee: number = 0;
            let receiptUrl: string | null = null;
            let receiptNumber: string | null = null;
            let receiptEmail: string | null = null;
            let paymentIntentId: string | null = null;
            let invoice: Stripe.Invoice | null = null;
            let currentPeriodStart: Date | null = null;
            let currentPeriodEnd: Date | null = null;
            let stripeSubscription: Stripe.Subscription | null = null;
            const stripeSubscriptionId = input.subscription as string;
            let invoiceId: string | null = (input.invoice as string) ?? null;

            if (stripeSubscriptionId) {
                stripeSubscription = await this.paymentGateway.getSubscription(stripeSubscriptionId);
            }

            if (!invoiceId) {
                invoiceId = typeof input.invoice === "string"
                    ? input.invoice
                    : (typeof stripeSubscription?.latest_invoice === "string"
                        ? stripeSubscription.latest_invoice
                        : (stripeSubscription?.latest_invoice as Stripe.Invoice)?.id);
            }

            if (invoiceId) {
                invoice = await this.paymentGateway.getInvoice(invoiceId);
                console.log("invoice : ", invoice);
                receiptEmail = invoice.customer_email;
                receiptNumber = invoice.number;
                receiptUrl = invoice.hosted_invoice_url || invoice.invoice_pdf as string;
            }

            if (stripeSubscription) {
                const primaryItem = stripeSubscription.items.data[0];

                currentPeriodStart = primaryItem?.current_period_start
                    ? new Date(primaryItem.current_period_start * 1000)
                    : new Date();

                currentPeriodEnd = primaryItem?.current_period_end
                    ? new Date(primaryItem.current_period_end * 1000)
                    : new Date();
            }

            const paymentData = Payment.createForSubscription({
                idempotencyKey: generateId(IdType.IDEMPOTENCY),
                paymentIntentId: paymentIntentId || generateId(IdType.PAYMENT_INTENT, input.id),
                gatewayFee: fee,
                transactionId: generateId(IdType.TRANSACTION),
                paymentStatus,
                paymentMethod,
                paymentGateway: PaymentGateway.STRIPE,
                paymentFor,
                discountAmount,
                totalAmount,
                providerId: providerId,
                chargeId: generateId(IdType.PAYMENT_CHARGEID, input.id),
                sessionId: input.id,
                receiptUrl,
                receiptNumber,
                receiptEmail,
                stripeCustomerId: customerId,
                stripeInvoiceId: invoiceId,
                stripeSubscriptionId: subscriptionId,
                customerEmail: input.customer_details?.email || email,
                description: input.metadata?.description || `Subscription for ${name}`,
            });

            const payment = await this.paymentRepository.create(paymentData);

            if (payment) {
                await this.kafkaProducer.publish<EventEnvelope<ProviderCreatePaymentSuccessEvent>>(
                    kafkaConfig.topics.pub.providerSubscriptionPaymentSuccess,
                    {
                        eventId: generateId(IdType.EVENT),
                        attempt: 1,
                        maxAttempts: 1,
                        occurredAt: new Date().toString(),
                        payload: {
                            mbsData: {
                                subscriptionId,
                                paymentId: payment._id,
                                providerId: providerId,
                                isTrial: String(isTrial),
                                planName: planName,
                                currentPeriodStart,
                                currentPeriodEnd
                            },
                            emailData: {
                                email,
                                name,
                                totalAmount,
                                paymentDate: payment.createdAt,
                                paymentStatus,
                                receiptUrl,
                                transactionId: paymentIntentId || input.id,
                                paymentFor,
                            },
                            notificationData: {
                                userId: providerId,
                                pushNotification: false,
                                title: notificationContentMap.providerSubscriptionPayment.title,
                                body: notificationContentMap.providerSubscriptionPayment.body(),
                            },
                        },
                    },
                )
            } else {
                throw new AppError(
                    "Failed to save payment",
                    500,
                    false,
                    ERROR_CODES.PAYMENT_SERVICE_ERROR
                )
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get provider revenue");
        };
    };
};