import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.ATTENDANCE_SERVICE_PORT) || 3002,
      },
    },
  );

  await app.listen();
  console.log('Attendance service is listening (TCP)');
}
bootstrap();
