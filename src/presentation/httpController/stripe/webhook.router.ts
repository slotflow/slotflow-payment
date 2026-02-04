import { Router } from "express";
import bodyParser from "body-parser";
import { stripeWebhookController } from "./stripe.webhook";

const router = Router();

router.post("/webhooks/stripe", bodyParser.raw({ type: "application/json" }), stripeWebhookController.handleStripeWebhook);

export default router;
