import { Router } from "express";
import { providerPaymentController } from "./providerPayment.controller";

const router = Router();

router.post("/subscription/checkout/session", providerPaymentController.subscriptionCheckout);

router.get('/provider', providerPaymentController.getPayments);

export default router;