import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EmployeeStatus } from '../constants/status.enum';
import { PaginationQueryDto } from './pagination.dto';

/**
 * Query params for GET /employees (admin only).
 * status/search are optional — no filter means "match everything".
 * page/limit (from PaginationQueryDto) default to page 1 / 20 per page.
 */
export class QueryEmployeeDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
