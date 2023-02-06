import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ImportHistoryModule } from './ImportHistory/import-history.module';
import { ImportTransactionModule } from './ImportTransaction/import-transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    TypeOrmModule.forRoot(typeOrmConfig), 
    ImportTransactionModule,
    ImportHistoryModule
  ],
})
export class AppModule {}
