import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICE_NAMES } from '@app/common';

// Central registration for both TCP clients so every feature module can
// import just this one module instead of repeating registerAsync config.
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICE_NAMES.EMPLOYEE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('EMPLOYEE_SERVICE_HOST', 'localhost'),
            port: config.get<number>('EMPLOYEE_SERVICE_PORT', 3001),
          },
        }),
      },
      {
        name: SERVICE_NAMES.ATTENDANCE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('ATTENDANCE_SERVICE_HOST', 'localhost'),
            port: config.get<number>('ATTENDANCE_SERVICE_PORT', 3002),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class TcpClientsModule {}
