import mongoose from 'mongoose';
import { kafkaConfig } from '../../../config/env';
import { refundPaymentInput } from "../../dtos/payment.dtos";
import { generateId } from '../../../shared/utils/generateId';
import { Refund } from "../../../domain/entities/refund.entity";
import { RefundStatus } from "../../../domain/enums/refund.enum";
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { PaymentStatus } from "../../../domain/enums/payment.enum";
import { toAppError } from '../../../shared/error/handleUnknownError';
import { notificationContentMap } from '../../../shared/utils/constants';
import { EventEnvelope, RefundPaymentEvent } from '../../dtos/kafka.dtos';
import { BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { IPaymentGateway } from "../../../domain/interfaces/payment/IPaymentGateway";
import { IRefundRepository } from "../../../domain/interfaces/repositories/IRefund.repository";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IKafkaProducerAdapter } from '../../../domain/interfaces/messaging/IKafkaProducerAdapter';

export class RefundPaymentUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly refundRepository: IRefundRepository,
        private readonly paymentGateway: IPaymentGateway,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { }

    async execute(input: refundPaymentInput): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { bookingId, paymentId, reasonInDetail, refundFor, refundReason, userId } = input;
            if (!bookingId ||
                !paymentId ||
                !reasonInDetail ||
                !refundFor ||
                !refundReason ||
                !userId
            ) {
                throw new BadRequestError();
            }

            const payment = await this.paymentRepository.findById(paymentId);
            if (!payment) {
                throw new NotFoundError(
                    "Payment not found",
                    ERROR_CODES.PAYMENT_NOT_FOUND);
            }

            if (!payment.paymentIntentId) {
                throw new BadRequestError();
            }

            if (payment.paymentStatus === PaymentStatus.REFUNDED) {
                throw new BadRequestError(
                    "Payment already refunded",
                    ERROR_CODES.PAYMENT_ALREADY_REFUNDED
                );
            }

            const refundAmount: number = Math.floor(payment.totalAmount / 2);

            const { refundId } = await this.paymentGateway.createRefund({
                paymentIntent: payment.paymentIntentId,
                refundAmount: refundAmount,
                reason: refundReason,
                metadata: {
                    bookingId,
                    paymentId,
                    reasonInDetail,
                    refundFor,
                }
            });

            const refund = Refund.create({
                idempotencyKey: generateId(IdType.IDEMPOTENCY),
                paymentId: paymentId,
                refundId: refundId,
                amount: refundAmount,
                refundStatus: RefundStatus.SUCCESS,
                refundGateway: payment.paymentGateway,
                reason: refundReason,
                refundFor: refundFor,
                reasonInDetail: reasonInDetail,
                metadata: {
                    bookingId,
                    userId
                }
            });

            const newRefund = await this.refundRepository.create(refund);
            if (!newRefund) {
                throw new NotFoundError(
                    "Refund creation failed",
                    ERROR_CODES.PAYMENT_SERVICE_ERROR
                );
            }

            payment.paymentRefunded({
                refundedAmount: (payment.refundedAmount || 0) + refundAmount
            });

            const updatedPayment = await this.paymentRepository.update(payment);
            if (!updatedPayment) {
                throw new NotFoundError(
                    "Payment update failed",
                    ERROR_CODES.PAYMENT_SERVICE_ERROR
                );
            }

            await session.commitTransaction();

            await this.kafkaProducer.publish<EventEnvelope<RefundPaymentEvent>>(
                kafkaConfig.topics.pub.refundPayment,
                {
                    eventId: generateId(IdType.EVENT),
                    occurredAt: new Date().toISOString(),
                    attempt: 1,
                    maxAttempts: 3,
                    payload: {
                        emailData: {
                            email: "",
                            name: "",
                            refundAmount,
                            refundDate: refund.createdAt,
                            refundStatus: refund.refundStatus,
                            transactionId: refundId,
                        },
                        notificationData: {
                            title: notificationContentMap.refundPayment.title,
                            body: notificationContentMap.refundPayment.body(RefundStatus.SUCCESS),
                            pushNotification: true,
                            userId,
                            data: {
                                refundAmount: refundAmount.toString()
                            }
                        }
                    }
                }
            )
        } catch (error: unknown) {
            session.abortTransaction();
            console.error("Refund failed:", error);
            throw toAppError(error, "Failed to process refund payment");
        } finally {
            session.endSession();
        }
    }
}