import { AppModule } from '@modules/app.module';
import { NestFactory } from '@nestjs/core';

const DEFAULT_PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? DEFAULT_PORT;
  await app.listen(port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
