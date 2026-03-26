import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authMiddleware } from "../../middleware/auth.Middleware";

const router = Router();

router.get('/', authMiddleware, paymentController.getPayments);

router.get('/:paymentId',authMiddleware, paymentController.getPaymentDetails);

router.post("/subscription/checkout/session", paymentController.subscriptionCheckout);

router.post('/booking/checkout/session', paymentController.bookingCheckout);

router.get('/reports/revenue', authMiddleware, paymentController.fetchRevenueReport);

router.post('/stripe/account-link', authMiddleware, paymentController.linkStripeAccount);

export default router;