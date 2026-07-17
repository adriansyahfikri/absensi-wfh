import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TcpClientsModule } from './clients/tcp-clients.module';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TcpClientsModule,
    AuthModule,
    EmployeesModule,
    AttendanceModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
