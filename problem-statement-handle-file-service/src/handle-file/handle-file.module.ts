import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HandleFileController } from './handle-file.controller';
import { HandleFileService } from './handle-file.service';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'IMPORT_FILE_RMQ',
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://localhost:5672'],
            queue: 'import_file_queue',
          queueOptions: {
            durable: true
          },
        },
      },
      {
        name: 'IMPORT_TRANSACTION_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 3001
        }
      },
      {
        name: 'AUTH',
        transport: Transport.TCP,
        options: {
          port: 3002
        }
      }
    ]),
    HttpModule
  ],
  controllers: [HandleFileController],
  providers: [HandleFileService]
})
export class HandleFileModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
