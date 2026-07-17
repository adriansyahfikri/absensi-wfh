import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeeDto,
  EMPLOYEE_PATTERNS,
  SERVICE_NAMES,
  Role,
} from '@app/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { sendTcp } from '../common/tcp.util';

@Controller('employees')
@Roles(Role.ADMIN)
export class EmployeesController {
  constructor(
    @Inject(SERVICE_NAMES.EMPLOYEE)
    private readonly employeeClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return sendTcp(this.employeeClient, EMPLOYEE_PATTERNS.CREATE, dto);
  }

  @Get()
  findAll(@Query() query: QueryEmployeeDto) {
    return sendTcp(this.employeeClient, EMPLOYEE_PATTERNS.FIND_ALL, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return sendTcp(this.employeeClient, EMPLOYEE_PATTERNS.FIND_ONE, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return sendTcp(this.employeeClient, EMPLOYEE_PATTERNS.UPDATE, { id, dto });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return sendTcp(this.employeeClient, EMPLOYEE_PATTERNS.REMOVE, id);
  }
}
