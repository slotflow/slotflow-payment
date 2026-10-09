import { kafkaProducer } from "../../infrastructure/messaging";
import { processedEventRepository } from "../../infrastructure/repository";
import { ProcessEventWrapperUseCase } from "../../application/useCases/kafka/processEventWrapper.useCase";

export const processEventWrapperUseCase = new ProcessEventWrapperUseCase(
  processedEventRepository,
  kafkaProducer,
);

export const handlers = {};
