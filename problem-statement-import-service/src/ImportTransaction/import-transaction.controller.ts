import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessageQueue } from 'src/constant/message-queue';
import { ImportTransactionService } from './import-transaction.service';
@Controller()
export class ImportTransactionController {
  constructor(private readonly transactionService: ImportTransactionService) {}

  @EventPattern('import-record')
  async getMessegeQueue(@Payload() data: MessageQueue, @Ctx() context: RmqContext): Promise<void> {
    await this.transactionService.processImportTransaction(data);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);   
  }
}