import app from './app';
import { appConfig } from './config/env';
import { log } from './shared/logger/logger';
import connectDB from './config/databse/mongodb/mongodb';

const start = async () => {
  try {
    await connectDB();

    app.listen(appConfig.port, () =>
      log.info(`Main Backend Service is running on http://localhost:${appConfig.port}`)
    );
    
  } catch (error) {
    log.error("Startup failed", error as Error);
    process.exit(1);
  }
};

start();
