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
    stripeSecretKey: appConfig.nodeEnv === "development" ? validator.requireEnv("STRIPE_SECRET_KEY_DEV") : validator.requireEnv("STRIPE_SECRET_KEY"),
    stripeWebhookSecret: appConfig.nodeEnv === "development" ? validator.requireEnv("STRIPE_WEBHOOK_SECRET_DEV") : validator.requireEnv("STRIPE_WEBHOOK_SECRET"),
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
            
        },
        pub: {
            // PS -> MBS & NS
            providerSubscriptionPaymentSuccess: validator.requireEnv("KAFKA_PROVIDER_SUBSCRIPTION_PAYMENT_SUCCESS"),
            userBookingPaymentSuccess: validator.requireEnv("KAFKA_USER_BOOKING_PAYMENT_SUCCESS"),

            // PS -> MBS
            providerSubscriptionPaymentFailed: validator.requireEnv("KAFKA_PROVIDER_SUBSCRIPTION_PAYMENT_FAILED"),
            userBookingPaymentFailed: validator.requireEnv("KAFKA_USER_BOOKING_PAYMENT_FAILED"),
            stripeAccountCreated: validator.requireEnv("KAFKA_STRIPE_ACCOUNT_CREATED"),
            stripeCustomerCreated: validator.requireEnv("KAFKA_STRIPE_CUSTOMER_CREATED"),

        },
    },
};
