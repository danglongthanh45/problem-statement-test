import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportHistory } from 'src/db/history-import.entity';
import { ImportTransaction } from 'src/db/transaction-import.entity';
import { ImportTransactionController } from './import-transaction.controller';
import { ImportTransactionService } from './import-transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImportTransaction]),
    TypeOrmModule.forFeature([ImportHistory]),
  ],
  controllers: [ImportTransactionController],
  providers: [ImportTransactionService],
})
export class ImportTransactionModule {}
