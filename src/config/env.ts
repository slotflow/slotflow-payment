import { Validator } from "../shared/validator/validator";

const validator = new Validator();

export const appConfig = {
  port: validator.requireNumber("PORT"),
  nodeEnv: validator.requireEnv("NODE_ENV"),
  isDev: validator.requireEnv("NODE_ENV") === "development",
  serviceName: validator.requireEnv("SERVICE_NAME"),
};

export const mongodbConfig = {
  mongoUri: appConfig.isDev
    ? validator.requireEnv("MONGO_URI_DEV")
    : validator.requireEnv("MONGO_URI"),
};

export const callbackUrlsConfig = {
  integrationsUrl: appConfig.isDev
    ? validator.requireEnv("INTEGRATION_CALLBACK_URL_DEV")
    : validator.requireEnv("INTEGRATION_CALLBACK_URL"),
  subscriptionUrl: appConfig.isDev
    ? validator.requireEnv("SUBSCRIPTION_CALLBACK_URL_DEV")
    : validator.requireEnv("SUBSCRIPTION_CALLBACK_URL"),
  bookingUrl: appConfig.isDev
    ? validator.requireEnv("BOOKING_CALLBACK_URL_DEV")
    : validator.requireEnv("BOOKING_CALLBACK_URL"),
};

export const serviceConfig = {
  frontendUrl: appConfig.isDev
    ? validator.requireEnv("FRONTEND_URL_DEV")
    : validator.requireEnv("FRONTEND_URL"),
  apiGatewayUrl: appConfig.isDev
    ? validator.requireEnv("API_GATEWAY_URL_DEV")
    : validator.requireEnv("API_GATEWAY_URL"),
  mainBackendServiceUrl: appConfig.isDev
    ? validator.requireEnv("MAIN_BACKEND_SERVICE_URL_DEV")
    : validator.requireEnv("MAIN_BACKEND_SERVICE_URL"),
  realtimeServiceUrl: appConfig.isDev
    ? validator.requireEnv("REALTIME_SERVICE_URL_DEV")
    : validator.requireEnv("REALTIME_SERVICE_URL"),
  notificationServiceUrl: appConfig.isDev
    ? validator.requireEnv("NOTIFICATION_SERVICE_URL_DEV")
    : validator.requireEnv("NOTIFICATION_SERVICE_URL"),
  paymentServiceUrl: appConfig.isDev
    ? validator.requireEnv("PAYMENT_SERVICE_URL_DEV")
    : validator.requireEnv("PAYMENT_SERVICE_URL"),
};

export const stripeConfig = {
  stripeSecretKey: appConfig.isDev
    ? validator.requireEnv("STRIPE_SECRET_KEY_DEV")
    : validator.requireEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: appConfig.isDev
    ? validator.requireEnv("STRIPE_WEBHOOK_SECRET_DEV")
    : validator.requireEnv("STRIPE_WEBHOOK_SECRET"),
};

export const redisConfig = {
  redisUrl: validator.requireEnv("REDIS_URL"),
  redisToken: validator.requireEnv("REDIS_TOKEN"),
};

export const otelConfig = {
  otelExporterOtlpTracesEndpoint: appConfig.isDev
    ? validator.requireEnv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT_DEV")
    : validator.requireEnv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"),
  otelExporterOtlpMetricsEndpoint: appConfig.isDev
    ? validator.requireEnv("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT_DEV")
    : validator.requireEnv("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT"),
  otelExporterOtlpLogsEndpoint: appConfig.isDev
    ? validator.requireEnv("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT_DEV")
    : validator.requireEnv("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"),
};

export const kafkaConfig = {
  clientId: validator.requireEnv("KAFKA_CLIENT_ID"),
  groups: {
    groupId: validator.requireEnv("KAFKA_GROUP_ID"),
  },

  brokers: [
    validator.requireEnv("KAFKA_BROKER_1"),
    // validator.requireEnv("KAFKA_BROKER_2"),
    // validator.requireEnv("KAFKA_BROKER_3"),
  ],

  topics: {
    dlqTopic: validator.requireEnv("KAFKA_DLQ_TOPIC"),
    sub: {},

    pub: {
      // PS -> MBS & NS [ email, notification ]
      providerSubscriptionPaymentSuccess: validator.requireEnv(
        "KAFKA_PROVIDER_SUBSCRIPTION_PAYMENT_SUCCESS",
      ),
      providerSubscriptionPaymentFailed: validator.requireEnv(
        "KAFKA_PROVIDER_SUBSCRIPTION_PAYMENT_FAILED",
      ),

      userBookingPaymentSuccess: validator.requireEnv("KAFKA_USER_BOOKING_PAYMENT_SUCCESS"),
      userBookingPaymentFailed: validator.requireEnv("KAFKA_USER_BOOKING_PAYMENT_FAILED"),

      stripeAccountStatusUpdated: validator.requireEnv("KAFKA_STRIPE_ACCOUNT_STATUS_UPDATED"),

      userBookingRefundPaymentSuccess: validator.requireEnv(
        "KAFKA_USER_BOOKING_REFUND_PAYMENT_SUCCESS",
      ),
    },
  },
};
