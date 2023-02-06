import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportHistory } from 'src/db/history-import.entity';
import { ImportHistoryService } from './import-history.service';
import { ImportHistoryController } from './import-history.controller';
import * as cookieParser from 'cookie-parser';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    TypeOrmModule.forFeature([ImportHistory]),
    ClientsModule.register([
      {
        name: 'AUTH',
        transport: Transport.TCP,
        options: {
          port: 3002
        }
      }
    ]),
  ],
  controllers: [ImportHistoryController],
  providers: [ImportHistoryService],
})
export class ImportHistoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}