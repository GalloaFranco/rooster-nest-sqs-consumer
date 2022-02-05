import { Injectable } from '@nestjs/common';
import {
  DeleteMessageCommand,
  DeleteMessageCommandInput,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  ReceiveMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {Cron, CronExpression, SchedulerRegistry} from "@nestjs/schedule";

@Injectable()
export class SqsConsumerService {
  private readonly region = process.env.REGION || 'us-east-1';
  private sqsClient: SQSClient;
  private queueUrl: string;
  private params: ReceiveMessageCommandInput;

  constructor(private scheduleRegistry: SchedulerRegistry) {}


  setupConsumer(queueUrl: string) {
    this.queueUrl = queueUrl;
    this.sqsClient = new SQSClient({ region: this.region });
    this.params = {
      AttributeNames: ['SentTimestamp'],
      MessageAttributeNames: ['All'],
      QueueUrl: this.queueUrl,
      VisibilityTimeout: 30,
      WaitTimeSeconds: 10,
    } as ReceiveMessageCommandInput;
  }


  @Cron(CronExpression.EVERY_SECOND, {
    name: 'rooster-sqs-consumer'
  })
  async listenQueue(handlerFunction: (value: ReceiveMessageCommandOutput) => Promise<void> ) {

      const result = await this.sqsClient.send(
        new ReceiveMessageCommand(this.params),
      );
      await handlerFunction(result);
  }

  async deleteMessageFromQueue(deleteInput: DeleteMessageCommandInput) {
    return this.sqsClient.send(new DeleteMessageCommand(deleteInput));
  }

  stopListeningQueue() {
    this.scheduleRegistry.getCronJob('rooster-sqs-consumer').stop();
    this.sqsClient.destroy();
  }
}
