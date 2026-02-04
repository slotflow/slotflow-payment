import { Router } from "express";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/subscription/checkout/session", paymentController.subscriptionCheckout);

export default router;