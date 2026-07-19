/**
 * Public entry point for the shared library.
 * Apps import from '@app/common' instead of reaching into subfolders,
 * e.g. import { CreateEmployeeDto, EMPLOYEE_PATTERNS, Role } from '@app/common';
 */

// constants
export * from './constants/patterns';
export * from './constants/role.enum';
export * from './constants/status.enum';

// dto
export * from './dto/login.dto';
export * from './dto/create-employee.dto';
export * from './dto/update-employee.dto';
export * from './dto/check-in.dto';
export * from './dto/check-out.dto';
export * from './dto/pagination.dto';
export * from './dto/query-employee.dto';
export * from './dto/query-attendance.dto';

// interfaces
export * from './interfaces/jwt-payload.interface';
export * from './interfaces/paginated-result.interface';
