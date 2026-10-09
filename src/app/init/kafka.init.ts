import { kafkaConsumer, kafkaProducer } from "../../infrastructure/messaging";
import { kafkaConsumerController } from "../../presentation/kafka/kafka.controller";

export const initKafka = async () => {
  await kafkaConsumer.connectConsumer();
  await kafkaProducer.connectProducer();

  await kafkaConsumerController.startListening();
};

export const stopKafka = async () => {
  await kafkaConsumer.disconnectConsumer();
  await kafkaProducer.disconnectProducer();
};
