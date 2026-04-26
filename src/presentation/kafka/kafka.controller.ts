import { kafkaConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { handlers, processEventWrapperUseCase } from ".";
import { kafkaConsumer } from "../../infrastructure/messaging";
import { PSSubKafkaEventPayload } from "../../application/dtos/kafka.dtos";
import { IKafkaConsumerAdapter } from "../../domain/interfaces/messaging/IKafkaConsumerAdapter";
import { ProcessEventWrapperUseCase } from "../../application/useCases/kafka/processEventWrapper.useCase";

class KafkaConsumerController {
  constructor(
    private readonly kafkaConsumer: IKafkaConsumerAdapter,
    private readonly processEventWrapperUseCase: ProcessEventWrapperUseCase
  ) {
    this.startListening = this.startListening.bind(this);
  };

  async startListening(): Promise<void> {
    try {
      log.info("start listening kafka controller");

      for (const [key, topic] of Object.entries(kafkaConfig.topics.sub)) {
        const useCase = handlers[key as keyof typeof handlers];
        if (!useCase) continue;

        await this.kafkaConsumer.subscribe(topic as string, async ({ message }) => {
          if (!message.value) return;
          const eventData = JSON.parse(message.value.toString());
          await this.processEventWrapperUseCase.execute({
            businessUseCase: useCase,
            eventData,
            topic: topic as string,
            payloadExtractor: (payload: PSSubKafkaEventPayload) => payload.paymentData
          });
        });
      };

      await this.kafkaConsumer.startConsumer();
    } catch (error) {
      log.error("kafka controller startListening failed : ", error as Error);
    };
  };
};

export const kafkaConsumerController = new KafkaConsumerController(
  kafkaConsumer,
  processEventWrapperUseCase
);