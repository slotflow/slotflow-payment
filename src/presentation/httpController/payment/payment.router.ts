import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authMiddleware } from "../../middleware/auth.Middleware";

const router = Router();

router.get('/', 
    authMiddleware, 
    paymentController.getPayments
);

router.post("/subscription/checkout/session", 
    authMiddleware, 
    paymentController.subscriptionCheckout
);

router.post('/booking/checkout/session', 
    authMiddleware, 
    paymentController.bookingCheckout
);

router.post("/refund",
    authMiddleware,
    paymentController.refund
);

router.get('/reports/revenue', 
    authMiddleware, 
    paymentController.getRevenueReport
);

router.post('/stripe/account-link', 
    authMiddleware, 
    paymentController.linkStripeAccount
);

router.get('/revenue', 
    authMiddleware, 
    paymentController.getRevenue
);

router.get('/:paymentId', 
    authMiddleware, 
    paymentController.getPaymentDetails
);

export default router;