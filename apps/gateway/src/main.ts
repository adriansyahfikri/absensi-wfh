import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Frontend (Vite dev server / static build) runs on a different origin.
  app.enableCors();

  // Global validation: rejects unknown fields (whitelist) and coerces
  // query/param types (transform). Required for the DTOs in @app/common.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Check-in photos are saved here by Multer (see attendance.controller.ts);
  // serve them back so the admin attendance view can render them.
  app.useStaticAssets(
    join(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
    {
      prefix: '/uploads',
    },
  );

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`Gateway is running on http://localhost:${port}`);
}
bootstrap();
