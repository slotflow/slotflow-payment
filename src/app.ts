import helmet from 'helmet';
import dotenv from 'dotenv';
import express from 'express';
import client from 'prom-client';
import cookieParser from 'cookie-parser';
import v1router from './presentation/router/router.v1';
import webhookRoutes from './presentation/httpController/stripeWebhook/stripe.router';
import { errorHandler } from './presentation/middleware/error.middleware';

dotenv.config();

const app = express();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.use(helmet());
app.use(webhookRoutes);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/v1", v1router);

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
})

app.use(errorHandler);

export default app;