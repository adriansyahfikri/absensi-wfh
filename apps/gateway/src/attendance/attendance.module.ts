import { Module } from '@nestjs/common';
import { TcpClientsModule } from '../clients/tcp-clients.module';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [TcpClientsModule],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
