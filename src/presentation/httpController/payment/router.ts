import { Router } from "express";
import { paymentController } from "./paymentController";
import { authMiddleware } from "../../middleware/auth.Middleware";

const router = Router();

router.post("/subscription/checkout/session", authMiddleware,paymentController.subscriptionCheckout);

router.get('/', authMiddleware, paymentController.getPayments);

router.get('/:paymentId',authMiddleware, paymentController.getPaymentDetails);

router.post('/booking/checkout/session', authMiddleware, )

export default router;