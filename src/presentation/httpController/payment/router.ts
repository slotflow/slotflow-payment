import { Router } from "express";
import { paymentController } from "./paymentController";
import { authMiddleware } from "../../middleware/auth.Middleware";

const router = Router();

router.get('/', authMiddleware, paymentController.getPayments);

router.get('/:paymentId',authMiddleware, paymentController.getPaymentDetails);

router.post("/subscription/checkout/session", paymentController.subscriptionCheckout);

router.post('/booking/checkout/session', paymentController.bookingCheckout);

export default router;