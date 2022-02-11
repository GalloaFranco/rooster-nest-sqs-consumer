import { Injectable } from '@nestjs/common';
import {
  DeleteMessageCommand,
  DeleteMessageCommandInput,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  ReceiveMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';

@Injectable()
export class SqsConsumerService {
  private readonly region = process.env.REGION || 'us-east-1';
  private sqsClient: SQSClient;
  private queueUrl: string;
  private isRunning: boolean;

  initializeSqsConsumer(queueUrl: string, localstackEndpoint?: string) { // Move parameters to specific folder, add verbose mode for logs
    this.queueUrl = queueUrl;
    this.isRunning = true;
    this.sqsClient = new SQSClient({
      region: this.region,
      endpoint: localstackEndpoint || '',
    });
  }

  async listenQueue(
    handlerFunction: (value: ReceiveMessageCommandOutput) => Promise<void>,
  ) {
    const params = {
      AttributeNames: ["SentTimestamp"],
      MessageAttributeNames: ["All"],
      QueueUrl: this.queueUrl,
      VisibilityTimeout: 20,
      WaitTimeSeconds: 10,
    } as ReceiveMessageCommandInput;

   while(this.isRunning) {
     const result = await this.sqsClient.send(
         new ReceiveMessageCommand(params),
     );
     if (result.Messages) {
       await handlerFunction(result);
     }
   }
  }

  async deleteMessageFromQueue(deleteInput: DeleteMessageCommandInput) {
    return this.sqsClient.send(new DeleteMessageCommand(deleteInput));
  }

  stopSqsListening() {
    this.isRunning = false;
    this.sqsClient.destroy();
  }
}
