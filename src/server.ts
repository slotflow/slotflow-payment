import app from './app';
import { appConfig } from './config/env';
import { log } from './shared/logger/logger';
import connectDB from './config/databse/mongodb/mongodb';
import { kafkaConsumer, kafkaProducer } from './infrastructure/messaging';
import { kafkaConsumerController } from './presentation/kafka.controller';

const start = async () => {
  try {
    await connectDB();
    await kafkaConsumer.connectConsumer();
    await kafkaProducer.connectProducer();
    await kafkaConsumerController.startListening();

    app.listen(appConfig.port, () =>
      log.info(`Main Backend Service is running on http://localhost:${appConfig.port}`)
    );

  } catch (error) {
    log.error("Startup failed", error as Error);
    process.exit(1);
  }
};

start();
