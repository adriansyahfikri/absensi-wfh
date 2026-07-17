import { Module } from '@nestjs/common';
import { TcpClientsModule } from '../clients/tcp-clients.module';
import { EmployeesController } from './employees.controller';

@Module({
  imports: [TcpClientsModule],
  controllers: [EmployeesController],
})
export class EmployeesModule {}
