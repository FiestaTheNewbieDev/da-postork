import { AppModule } from '@modules/app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.init();
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
