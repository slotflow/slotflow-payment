import helmet from 'helmet';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import paymentRouter from './presentation/httpController/provider/router';
import webhookRoutes from './presentation/httpController/stripe/webhook.router';

dotenv.config();

const app = express();

// const collectDefaultMetrics = client.collectDefaultMetrics;
// collectDefaultMetrics({ register: client.register });

// app.use(cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
// }));

app.use(helmet());
app.use(webhookRoutes);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get('/metrics', async (req, res) => {
//     res.setHeader('Content-Type', client.register.contentType);
//     const metrics = await client.register.metrics();
//     res.send(metrics);
// })
app.use("/api/payments", paymentRouter);
// app.use("/api/payments/webhook", );
app.use("/status", (req, res) => {
    res.send("On Live");
});

export default app;