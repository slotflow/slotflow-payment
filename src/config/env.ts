import dotenv from 'dotenv';
dotenv.config();

import { Validator } from '../shared/validator/validator';

const validator = new Validator();

export const appConfig = {
    port: validator.requireNumber("PORT"),
    nodeEnv: validator.requireEnv("NODE_ENV"),
};

export const mongodbConfig = {
    mongoUri: appConfig.nodeEnv === "development" ? validator.requireEnv("MONGO_URI_DEV") : validator.requireEnv("MONGO_URI"),
};

export const serviceConfig = {
    frontendUrl: appConfig.nodeEnv === "development" ? validator.requireEnv("FRONTEND_URL_DEV") : validator.requireEnv("FRONTEND_URL"),
    apiGatewayUrl: appConfig.nodeEnv === "development" ? validator.requireEnv("API_GATEWAY_URL_DEV") : validator.requireEnv("API_GATEWAY_URL"),
    mainBackendServiceUrl: appConfig.nodeEnv === "development" ? validator.requireEnv("MAIN_BACKEND_SERVICE_URL_DEV") : validator.requireEnv("MAIN_BACKEND_SERVICE_URL"),
    realtimeServiceUrl: appConfig.nodeEnv === "development" ? validator.requireEnv("REALTIME_SERVICE_URL_DEV") : validator.requireEnv("REALTIME_SERVICE_URL"),
    notificationServiceUrl: appConfig.nodeEnv === "development" ? validator.requireEnv("NOTIFICATION_SERVICE_URL_DEV") : validator.requireEnv("NOTIFICATION_SERVICE_URL"),
    paymentServiceUrl: appConfig.nodeEnv === "development" ? validator.requireEnv("PAYMENT_SERVICE_URL_DEV") : validator.requireEnv("PAYMENT_SERVICE_URL"),
};

export const stripeConfig = {
    stripeApiKey: appConfig.nodeEnv === "development" ? validator.requireEnv("STRIPE_SECRET_KEY_DEV") : validator.requireEnv("STRIPE_SECRET_KEY"),
};

export const redisConfig = {
    redisUrl: validator.requireEnv("REDIS_URL"),
    redisToken: validator.requireEnv("REDIS_TOKEN"),
    redisTtl: validator.requireEnv("REDIS_TTL_SECONDS"),
};

export const kafkaConfig = {
    clientId: validator.requireEnv("KAFKA_CLIENT_ID"),
    groups: {
        groupId: validator.requireEnv("KAFKA_GROUP_ID"),
    },

    brokers: [
        validator.requireEnv("KAFKA_BROKER_1"),
        validator.requireEnv("KAFKA_BROKER_2"),
        validator.requireEnv("KAFKA_BROKER_3"),
    ],

    topics: {
        sub: {
            providerSubscriptionPayment: validator.requireEnv("KAFKA_PROVIDER_SUBSCRIPTION_PAYMENT"),

            userBookingPayment: validator.requireEnv("KAFKA_USER_BOOKING_PAYMENT"),

            providerPayoutPayment: validator.requireEnv("KAFKA_PROVIDER_PAYOUT"),

            userCancelBooking: validator.requireEnv("KAFKA_USER_CANCEL_BOOKING"),
        },
        pub: {
            providerSubscriptionPaymentSuccess: validator.requireEnv("KAFKA_PROVIDER_SUBSCRIPTION_PAYMENT_SUCCESS"),

            providerSubscriptionPaymentFailed: validator.requireEnv("KAFKA_PROVIDER_SUBSCRIPTION_PAYMENT_FAILED"),

            userBookingPaymentSuccess: validator.requireEnv("KAFKA_USER_BOOKING_PAYMENT_SUCCESS"),

            userBookingPaymentFailed: validator.requireEnv("KAFKA_USER_BOOKING_PAYMENT_FAILED"),

            providerPayoutSuccess: validator.requireEnv("KAFKA_PROVIDER_PAYOUT_SUCCESS"),

            providerPayoutFailed: validator.requireEnv("KAFKA_PROVIDER_PAYOUT_FAILED"),

            userCancelBookingSuccess: validator.requireEnv("KAFKA_USER_CANCEL_BOOKING_SUCCESS"),

            userCancelBookingFailed: validator.requireEnv("KAFKA_USER_CANCEL_BOOKING_FAILED"),
        },
    },
};
