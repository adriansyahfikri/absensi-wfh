import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EmployeeStatus } from '../constants/status.enum';

/**
 * Query params for GET /employees (admin only).
 * All optional — no filter means "return everything".
 */
export class QueryEmployeeDto {
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
