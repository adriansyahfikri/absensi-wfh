import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // This app runs as a pure microservice (no HTTP). It listens on TCP.
  // host must be '0.0.0.0' (not 'localhost') so it is reachable from other
  // containers on the Docker network — this is the #1 gotcha.
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.EMPLOYEE_SERVICE_PORT) || 3001,
      },
    },
  );

  await app.listen();
  console.log('Employee service is listening (TCP)');
}
bootstrap();
