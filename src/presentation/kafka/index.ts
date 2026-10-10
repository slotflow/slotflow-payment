import { kafkaProducer } from "../../infrastructure/messaging";
import { HandlerMap } from "../../application/dtos/kafka.dtos";
import { processedEventRepository } from "../../infrastructure/repository";
import { ProcessEventWrapperUseCase } from "../../application/useCases/kafka/processEventWrapper.useCase";

export const processEventWrapperUseCase = new ProcessEventWrapperUseCase(
  processedEventRepository,
  kafkaProducer,
);

export const handler: HandlerMap = {};
