import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { FallbackExceptionFilter } from './filter/fallback.filter';
import { HttpExceptionFilter } from './filter/http.filter';
import { ValidationFilter } from './filter/validation.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(
    new FallbackExceptionFilter, 
    new HttpExceptionFilter(), 
    new ValidationFilter()
  );
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'import_file_queue',
        noAck: false,
        queueOptions: {
          durable: true
        },
        prefetchCount: 1
      },
  });
  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
