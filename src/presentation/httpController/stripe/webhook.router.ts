import express from 'express';
import { Router } from "express";
import { stripeWebhookController } from "./stripe.webhook";

const router = Router();

router.post("/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookController.handleStripeWebhook);

export default router;
