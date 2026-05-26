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

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async retrievePaymentIntentWithRetry(
        paymentIntentId: string,
        maxRetries: number = 3,
        initialDelayMs: number = 500
    ): Promise<Stripe.PaymentIntent> {
        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const paymentIntentDetail = await this.paymentGateway.retrievePaymentIntent({
                    paymentIntent: paymentIntentId
                });
                
                const latestCharge = paymentIntentDetail.paymentIntent.latest_charge as Stripe.Charge;
                
                if (latestCharge && latestCharge.balance_transaction) {
                    return paymentIntentDetail.paymentIntent;
                }
                
                if (attempt < maxRetries - 1) {
                    const delayMs = initialDelayMs * Math.pow(2, attempt);
                    await this.sleep(delayMs);
                }
            } catch (error) {
                lastError = error as Error;
                if (attempt < maxRetries - 1) {
                    const delayMs = initialDelayMs * Math.pow(2, attempt);
                    await this.sleep(delayMs);
                }
            }
        }
        
        throw new AppError(
            "Payment charge or balance transaction details missing after retries",
            500,
            false,
            ERROR_CODES.PAYMENT_INVALID_RESPONSE
        );
    }

    async execute(input: Stripe.Checkout.Session): Promise<void> {
        try {

            if (!input) {
                throw new BadRequestError();
            }

            let receiptUrl: string | null = null;
            let receiptNumber: string | null = null;
            let receiptEmail: string | null = null;

            const stripePaymentIntent = await this.retrievePaymentIntentWithRetry(
                input.payment_intent as string
            );

            if (!stripePaymentIntent.latest_charge) {
                throw new BadRequestError("Payment charge details missing");
            }

            const latestCharge = stripePaymentIntent.latest_charge as Stripe.Charge;

            receiptUrl = latestCharge.receipt_url;
            receiptNumber = latestCharge.receipt_number;
            receiptEmail = latestCharge.receipt_email;

            const balanceTransaction = latestCharge.balance_transaction as Stripe.BalanceTransaction;
            const fee = balanceTransaction.fee;

            const subscriptionId = input?.metadata?.subscriptionId;
            const providerId = input?.metadata?.providerId;
            const planDuration = Number(input?.metadata?.planDuration);
            const paymentStatus = input?.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING;
            const paymentIntent = input?.payment_intent as string;
            const paymentMethod = input?.payment_method_types[0] as PaymentMethod;
            const paymentFor = input?.metadata?.paymentFor as PaymentFor;
            const name = input?.metadata?.name;
            const email = input?.metadata?.email;
            const initialAmount = Number(input?.metadata?.initialAmount);
            const totalAmount = (input.amount_total || 0) / 100;
            const discountAmount = (input.total_details?.amount_discount || 0) / 100;

            if (!planDuration ||
                !email ||
                !name ||
                !paymentIntent ||
                !paymentFor ||
                !subscriptionId
            ) {
                throw new BadRequestError();
            }

            if (!providerId) {
                throw new BadRequestError("Provider ID must be provided");
            }

            const paymentData = Payment.createForSubscription({
                idempotencyKey: generateId(IdType.IDEMPOTENCY),
                paymentIntentId: paymentIntent,
                gatewayFee: fee,
                transactionId: generateId(IdType.TRANSACTION),
                paymentStatus,
                paymentMethod,
                paymentGateway: PaymentGateway.STRIPE,
                paymentFor,
                initialAmount,
                discountAmount,
                totalAmount,
                providerId: providerId,
                chargeId: latestCharge.id,
                sessionId: input.id,
                receiptUrl,
                receiptNumber,
                receiptEmail,
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
                                planDuration,
                                providerId: providerId
                            },
                            emailData: {
                                email,
                                name,
                                totalAmount,
                                paymentDate: payment.createdAt,
                                paymentStatus,
                                receiptUrl,
                                transactionId: paymentIntent,
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