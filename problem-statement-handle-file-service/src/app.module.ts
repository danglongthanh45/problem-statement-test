import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HandleFileModule } from './handle-file/handle-file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    HandleFileModule
  ]
})
export class AppModule {}
