import { handlers } from ".";
import { kafkaConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { kafkaConsumer } from "../../infrastructure/messaging";
import { IKafkaConsumerAdapter } from "../../domain/interfaces/messaging/IKafkaConsumerAdapter";

class KafkaConsumerController {

  constructor(
    private readonly kafkaConsumerAdapter: IKafkaConsumerAdapter
  ) { };

  async startListening(): Promise<void> {
    try {
      log.info("start listening kafka controller");

      for (const [key, topic] of Object.entries(kafkaConfig.topics.sub)) {
        const useCase = handlers[key as keyof typeof handlers];
        if (!useCase) continue;

        await this.kafkaConsumerAdapter.subscribe(topic, async ({ message }) => {
          if (!message.value) return;
          const payload = JSON.parse(message.value.toString());
          await useCase.execute(payload);
        });
      };

      await this.kafkaConsumerAdapter.startConsumer();
    } catch (error) {
      log.error("kafka controller startListening failed : ", error as Error);
    };
  };
};

export const kafkaConsumerController = new KafkaConsumerController(kafkaConsumer);