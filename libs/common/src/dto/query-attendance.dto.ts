import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

/**
 * Query params for GET /attendance (admin view-only).
 * Filter by a specific date and/or a specific employee.
 * @Type coerces the incoming query string into a number for employeeId.
 * page/limit (from PaginationQueryDto) default to page 1 / 20 per page.
 */
export class QueryAttendanceDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  // Gateway-only: a name/code the admin typed in the Attendance search box.
  // The Gateway resolves this to `employeeIds` via employee-service before
  // forwarding the query to attendance-service — attendance-service must
  // not look up employees itself (see attendance.entity.ts). Never present
  // in the payload that actually reaches attendance-service.
  @IsOptional()
  @IsString()
  employeeSearch?: string;

  // Gateway-only: the resolved employeeIds for `employeeSearch`. Set by the
  // Gateway, not sent by the frontend.
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  employeeIds?: number[];
}
