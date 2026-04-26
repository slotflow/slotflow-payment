import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import v1router from '../presentation/router/router.v1';
import webhookRoutes from '../presentation/http/stripeWebhook/stripe.router';
import { errorHandler } from '../presentation/middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(webhookRoutes);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", v1router);

app.use(errorHandler);

export default app;