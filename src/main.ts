import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS with default options
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
