import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation: rejects unknown fields (whitelist) and coerces
  // query/param types (transform). Required for the DTOs in @app/common.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`Gateway is running on http://localhost:${port}`);
}
bootstrap();
