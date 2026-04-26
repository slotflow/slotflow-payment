import express from 'express';
import { Router } from "express";
import { stripeWebhookController } from "./stripe.controller";

const router = Router();

router.post("/stripe", express.raw({ type: "application/json" }), stripeWebhookController.handleStripeWebhook);

export default router;
