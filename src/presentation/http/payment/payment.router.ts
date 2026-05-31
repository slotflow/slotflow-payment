import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authMiddleware } from "../../middleware/auth.Middleware";

const router = Router();

router.get('/', 
    authMiddleware, 
    paymentController.getPayments
);

// main backend server to payment server
router.post("/subscription/checkout/session", 
    paymentController.subscriptionCheckout
);

// main backend server to payment server
router.post('/booking/checkout/session', 
    paymentController.bookingCheckout
);

// main backend server to payment server
router.post("/refund",
    paymentController.refund
);

router.get("/stripe/account/status/:accountId",
    paymentController.getStripeAccountStatus
);

router.post('/stripe/account-link', 
    authMiddleware, 
    paymentController.linkStripeAccount
);

router.get('/reports/revenue', 
    authMiddleware, 
    paymentController.getRevenueReport
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