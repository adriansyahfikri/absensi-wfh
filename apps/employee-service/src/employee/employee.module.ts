import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../entities/employee.entity';
import { User } from '../entities/user.entity';
import { EmployeeService } from './employee.service';
import { UserService } from './user.service';
import { EmployeeController } from './employee.controller';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, User])],
  controllers: [EmployeeController, AuthController],
  providers: [EmployeeService, UserService],
  exports: [EmployeeService, UserService],
})
export class EmployeeModule {}
