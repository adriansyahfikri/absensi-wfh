import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  EMPLOYEE_PATTERNS,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeeDto,
} from '@app/common';
import { EmployeeService } from './employee.service';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern(EMPLOYEE_PATTERNS.CREATE)
  create(@Payload() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @MessagePattern(EMPLOYEE_PATTERNS.FIND_ALL)
  findAll(@Payload() query: QueryEmployeeDto) {
    return this.employeeService.findAll(query);
  }

  @MessagePattern(EMPLOYEE_PATTERNS.FIND_ONE)
  findOne(@Payload() id: number) {
    return this.employeeService.findOne(id);
  }

  @MessagePattern(EMPLOYEE_PATTERNS.UPDATE)
  update(@Payload() payload: { id: number; dto: UpdateEmployeeDto }) {
    return this.employeeService.update(payload.id, payload.dto);
  }

  @MessagePattern(EMPLOYEE_PATTERNS.REMOVE)
  remove(@Payload() id: number) {
    return this.employeeService.remove(id);
  }
}
