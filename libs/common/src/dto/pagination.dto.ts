import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Shared page/limit fields for admin list endpoints. Extend this instead of
 * redeclaring page/limit on every query DTO. `transform: true` on the
 * gateway's global ValidationPipe (see main.ts) applies the defaults below
 * whenever the query param is omitted.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
