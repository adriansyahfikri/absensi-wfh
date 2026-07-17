import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

/**
 * Query params for GET /attendance (admin view-only).
 * Filter by a specific date and/or a specific employee.
 * @Type coerces the incoming query string into a number for employeeId.
 */
export class QueryAttendanceDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;
}
