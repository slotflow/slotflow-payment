 <div>

# SlotFlow Payment Service

### Payments, simplified.

A dedicated payment microservice powering SlotFlow's appointment payments, provider subscriptions, Stripe Connect onboarding, and event-driven payment workflows.

  <img src="https://img.shields.io/badge/Service-Payment_Processing-635BFF?style=for-the-badge" alt="Payment Processing" />
  <img src="https://img.shields.io/badge/Architecture-Microservices-6C63FF?style=for-the-badge" alt="Microservices" />
  <img src="https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Payments-Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />

---

### Live link & Repositories

  <a href="https://slotflow.online">
    <img src="https://img.shields.io/badge/Live_Application-SlotFlow-181717?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Application" />
  </a>
  <a href="https://github.com/slotflow">
    <img src="https://img.shields.io/badge/GitHub-SlotFlow-181717?style=for-the-badge&logo=github&logoColor=white" alt="SlotFlow GitHub" />
  </a>

### Technology Stack

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Stripe_Connect-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe Connect" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge" alt="Mongoose" />
  <img src="https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Apache Kafka" />
  <img src="https://img.shields.io/badge/KafkaJS-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="KafkaJS" />
  <img src="https://img.shields.io/badge/Winston-231F20?style=for-the-badge" alt="Winston" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
<img src="https://img.shields.io/badge/OpenTelemetry-7B3FF2?style=for-the-badge&logo=opentelemetry&logoColor=white" alt="OpenTelemetry" />
<img src="https://img.shields.io/badge/Tempo-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana Tempo" />
<img src="https://img.shields.io/badge/Loki-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana Loki" />
<img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus" />
<img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" />
</div>

---

## Overview

The **SlotFlow Payment Service** is a dedicated payment microservice within the SlotFlow appointment booking platform. It manages payment operations for appointment bookings and provider subscriptions, integrating with Stripe for checkout, recurring billing, and connected-account onboarding.

The service uses MongoDB to persist payment-related records and Apache Kafka to publish payment outcomes and provider account status events to other services in the SlotFlow ecosystem.

Its payment-gateway abstraction separates payment operations from the application workflow, keeping the current Stripe integration structured for potential future support of additional payment providers.

---

## Core Features

### Appointment Payments

- One-time Stripe Checkout sessions for appointment bookings.
- Payment outcome processing through Stripe webhooks.
- Persistent payment records in MongoDB.
- Kafka events for successful and failed booking payments.

### Provider Subscriptions

- Stripe subscription checkout for service providers.
- Recurring subscription invoice payment handling.
- Successful and failed subscription payment processing.
- Kafka events for subscription payment outcomes.

### Stripe Connect

- Stripe Express connected-account creation.
- Provider onboarding links.
- Connected-account status updates.
- Tracking of account capabilities, including payout readiness.

### Stripe Webhooks

- Webhook signature verification.
- Handling of successful and failed invoice payments.
- Processing of expired checkout sessions.
- Connected-account status and authorization updates.
- Event-driven payment state synchronization.

### Event-Driven Architecture

- Apache Kafka integration for asynchronous communication.
- Payment outcome events for downstream services.
- Provider account status events.
- Kafka producer and consumer infrastructure.

### Payment Data Management

- MongoDB-backed payment records.
- Payment account data management.
- Processed-event persistence.
- Mongoose-based data modeling.

### Extensible Payment Gateway

- A dedicated payment-gateway abstraction.
- Stripe as the currently integrated payment provider.
- Separation between payment operations and application workflows.
- An architecture designed to accommodate additional gateways as the platform evolves.

---

## Technology Stack

### Runtime & Backend

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

### Payments & Billing

<p align="left">
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Stripe_Checkout-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe Checkout" />
  <img src="https://img.shields.io/badge/Stripe_Billing-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe Billing" />
  <img src="https://img.shields.io/badge/Stripe_Connect-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe Connect" />
</p>

### Data & Messaging

<p align="left">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge" alt="Mongoose" />
  <img src="https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Apache Kafka" />
  <img src="https://img.shields.io/badge/KafkaJS-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="KafkaJS" />
</p>

### Logging & Observability

<p align="left">
  <img src="https://img.shields.io/badge/Winston-231F20?style=for-the-badge" alt="Winston" />
  <img src="https://img.shields.io/badge/OpenTelemetry-000000?style=for-the-badge&logo=opentelemetry&logoColor=white" alt="OpenTelemetry" />
  <img src="https://img.shields.io/badge/OTLP-5C2D91?style=for-the-badge" alt="OTLP" />
</p>

---

## Architecture

The Payment Service manages the payment lifecycle between SlotFlow and Stripe. Payment outcomes and connected-account updates are persisted in MongoDB and published through Kafka for downstream processing.

```mermaid
flowchart TD
    Platform["SlotFlow Platform"]
    Payment["SlotFlow Payment Service"]

    subgraph StripeServices["Stripe Integration"]
        Checkout["Stripe Checkout"]
        Billing["Stripe Subscriptions"]
        Connect["Stripe Connect"]
        Webhooks["Stripe Webhooks"]
    end

    Database[("MongoDB")]
    Kafka[["Apache Kafka"]]
    Consumers["Downstream SlotFlow Services"]

    Platform -->|"Payment requests"| Payment

    Payment --> Checkout
    Payment --> Billing
    Payment --> Connect

    Checkout --> Webhooks
    Billing --> Webhooks
    Connect --> Webhooks

    Webhooks -->|"Verified events"| Payment

    Payment <-->|"Payment and account records"| Database
    Payment -->|"Payment outcomes and account updates"| Kafka
    Kafka --> Consumers
```

### Architecture Principles

- Dedicated microservice for payment operations.
- Payment-gateway abstraction with Stripe as the current provider.
- Separation of payment workflows from gateway integration.
- MongoDB for persistent payment-related data.
- Kafka for asynchronous communication with downstream services.
- Stripe webhooks for payment lifecycle event processing.
- Architecture designed to support future payment-provider integrations.

---

## Payment Capabilities

### Stripe Payments

The service creates one-time checkout sessions for appointment bookings and processes payment outcomes from Stripe events.

### Stripe Subscriptions

Provider subscription checkout and recurring invoice payment events are handled through Stripe Billing integration.

### Stripe Connect

The service supports connected-account onboarding for providers and tracks their account status and payout eligibility.

### Stripe Webhooks

Stripe webhooks provide event-driven updates for payment outcomes, expired checkout sessions, and connected-account changes. Webhook signatures are verified before processing.

### Payout Readiness

The service integrates with Stripe Connect account capabilities to track whether a provider's account is enabled to receive payouts. This represents payout readiness; a complete payout initiation workflow is not documented as an implemented capability.

---

## Data & Infrastructure

### MongoDB

MongoDB provides persistent storage for payment-related information.

Identified data includes:

- Payment records.
- Payment account records.
- Processed-event records.

Mongoose provides the data modeling layer.

### Apache Kafka

Kafka supports asynchronous communication between the Payment Service and other SlotFlow services.

The service publishes events related to booking payments, subscription payments, and provider account status changes.

### Stripe

Stripe provides the current payment infrastructure for:

- Appointment checkout.
- Provider subscription billing.
- Connected-account onboarding.
- Payment lifecycle webhooks.

The gateway abstraction allows the service to evolve toward a multi-provider architecture without making Stripe-specific operations the only application-level integration boundary.

---

## Project Structure

```text
slotflow-payment/
└── src/
    ├── app/
    ├── application/
    ├── config/
    ├── domain/
    ├── infrastructure/
    ├── presentation/
    ├── shared/
    ├── express.d.ts
    └── server.ts
```

---

## Observability

- **Logging:** Winston writes to the console. In development it also writes JSON logs to `logs/combined.log` and `logs/error.log`; the directory is created by the logger when needed. The configured Winston OpenTelemetry transport exports log records.
- **Traces:** The OpenTelemetry Node SDK uses Node auto-instrumentations and exports traces over OTLP/gRPC.
- **Metrics:** Metrics are exported over OTLP/gRPC every 10 seconds by the configured periodic metric reader.
- **Logs:** OpenTelemetry logs are exported over OTLP/HTTP.
- **Resource attributes:** The service name comes from `SERVICE_NAME`; the resource also includes version `1.0.0` and a development/production environment attribute.
- **Health response:** `GET /` returns a simple gateway-online JSON response. It does not check Redis, exporters, or downstream services.
- **Shutdown:** `SIGINT` and `SIGTERM` initiate OpenTelemetry shutdown and then close the HTTP server.

The receiver endpoints and any collector, metrics backend, log backend, or trace backend are externally configured. This repository does not include their deployment or dashboard configuration.

---

## Related Repositories

Only repositories with verified GitHub URLs are linked below. The backend targets correspond to services configured by this gateway; the infrastructure repository is related context and is not provisioned by this project.

<div align="center">

[![SlotFlow Client](https://img.shields.io/badge/slotflow-slotflow--client-181717?style=for-the-badge&logo=github)](https://github.com/slotflow/slotflow-client)
[![Main Backend](https://img.shields.io/badge/slotflow-slotflow--backend--main-181717?style=for-the-badge&logo=github)](https://github.com/slotflow/slotflow-backend-main)
[![Realtime Service](https://img.shields.io/badge/slotflow-slotflow--socket-181717?style=for-the-badge&logo=github)](https://github.com/slotflow/slotflow-socket)
[![Payment Service](https://img.shields.io/badge/slotflow-slotflow--payment-181717?style=for-the-badge&logo=github)](https://github.com/slotflow/slotflow-payment)
[![Notification Service](https://img.shields.io/badge/slotflow-slotflow--notification-181717?style=for-the-badge&logo=github)](https://github.com/slotflow/slotflow-notification)
[![Infrastructure](https://img.shields.io/badge/slotflow-slotflow--infra-181717?style=for-the-badge&logo=github)](https://github.com/slotflow/slotflow-infra)

</div>

---

## Project Highlights

- Dedicated payment microservice for SlotFlow.
- Stripe Checkout for appointment payments.
- Stripe Billing for provider subscriptions.
- Stripe Connect onboarding and payout-readiness tracking.
- Stripe webhook processing.
- MongoDB-backed payment data persistence.
- Kafka-based payment event publishing.
- Payment-gateway abstraction for future provider integrations.
- OpenTelemetry instrumentation and Winston logging.
- TypeScript-based Node.js implementation.

---

## License

**Proprietary — All Rights Reserved**

Copyright © 2026 SlotFlow.

The SlotFlow source code and associated assets are proprietary and confidential
property of SlotFlow.

No permission is granted to any person or organization to:

- Use the software for personal, commercial, or production purposes
- Copy, reproduce, or redistribute the source code
- Modify, adapt, or create derivative works
- Sell, sublicense, lease, or otherwise commercialize the software
- Incorporate any portion of the software into another product or service
- Host or deploy the software without explicit written permission

Viewing the source code on GitHub does not grant any license or rights to use,
modify, distribute, or commercialize the software.

Any use beyond viewing the repository requires prior written permission from
SlotFlow.

All rights reserved.

---

<div align="center">

### SlotFlow Payment Service

**Payments, simplified.**

<a href="https://slotflow.online">Live Application</a>
·
<a href="https://github.com/slotflow">GitHub Organization</a>

© 2026 SlotFlow Technologies Private Limited

</div>
