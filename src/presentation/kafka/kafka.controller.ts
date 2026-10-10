import { kafkaConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { handler, processEventWrapperUseCase } from ".";
import { kafkaConsumer } from "../../infrastructure/messaging";
import { HandlerMap } from "../../application/dtos/kafka.dtos";
import { IKafkaConsumerAdapter } from "../../application/interfaces/messaging/IKafkaConsumer.adapter";
import { ProcessEventWrapperUseCase } from "../../application/useCases/kafka/processEventWrapper.useCase";

class KafkaConsumerController {
  constructor(
    private readonly kafkaConsumer: IKafkaConsumerAdapter,
    private readonly processEventWrapperUseCase: ProcessEventWrapperUseCase,
  ) {
    this.startListening = this.startListening.bind(this);
  }

  private async register<K extends keyof HandlerMap>(topic: string, useCase: HandlerMap[K]) {
    await this.kafkaConsumer.subscribe(topic, async ({ message }) => {
      if (!message.value) return;
      const eventData = JSON.parse(message.value.toString());
      await this.processEventWrapperUseCase.execute({
        businessUseCase: useCase,
        eventData,
        topic,
      });
    });
  }

  async startListening(): Promise<void> {
    try {
      log.info("start listening kafka controller");

      log.info("start listening kafka controller");

      for (const [key, topic] of Object.entries(kafkaConfig.topics.sub)) {
        const useCase = handler[key as keyof HandlerMap];
        if (!useCase) continue;
        /**
         * TODO remove the as string explitic type assertion,
         * because currently there is no subscription event payload
         *  */
        await this.register(topic as string, useCase);
      }

      await this.kafkaConsumer.startConsumer();
    } catch (error) {
      log.error("kafka controller startListening failed : ", { error });
    }
  }
}

export const kafkaConsumerController = new KafkaConsumerController(
  kafkaConsumer,
  processEventWrapperUseCase,
);
