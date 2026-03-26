import { Router } from 'express';
import paymentRouter from '../httpController/payment/payment.router';

const router = Router();

router.use("/payments", paymentRouter);

export default router;