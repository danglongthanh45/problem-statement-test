import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessageQueue } from 'src/constant/message-queue';
import { ImportTransactionService } from './import-transaction.service';
@Controller()
export class ImportTransactionController {
  constructor(private readonly transactionService: ImportTransactionService) {}

  // @Get('all')
  // all() {
  //   return this.transactionService.getAllTransaction();
  // }

  @EventPattern('import-record')
  async getMessegeQueue(@Payload() data: MessageQueue, @Ctx() context: RmqContext): Promise<void> {
    console.log('-handle-', data);
    // await (new Promise(resolve => setTimeout(resolve, 5000)));
    await this.transactionService.processImportTransaction(data);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
    console.log('-endhandle-');    
  }

}