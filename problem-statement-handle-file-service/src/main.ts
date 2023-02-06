import { NestFactory } from '@nestjs/core';
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
  await app.listen(3000);
}

bootstrap();
