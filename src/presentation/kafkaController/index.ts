import { kafkaProducer } from "../../infrastructure/messaging"
import { processedEventRepository } from "../../infrastructure/repositoryImpls"
import { ProcessEventWrapperUseCase } from "../../application/useCases/kafkaConsumerUsecases/processEventWrapper.useCase"

export const processEventWrapperUseCase = new ProcessEventWrapperUseCase(processedEventRepository, kafkaProducer);

export const handlers = {

}