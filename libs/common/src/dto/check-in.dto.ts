import { IsInt, IsNotEmpty, IsString } from 'class-validator';

/**
 * Payload sent from Gateway → Attendance Service for check-in.
 *
 * Important: the client does NOT send these fields directly.
 * - `employeeId` is resolved from the authenticated JWT (not the request body),
 *   so a user cannot check in on behalf of someone else.
 * - `photoPath` is produced by the Gateway after it stores the uploaded file;
 *   only the resulting path crosses the service boundary, never the binary.
 * - the check-in timestamp is generated server-side inside the service and is
 *   deliberately absent here, so it cannot be spoofed by the client.
 */
export class CheckInDto {
  @IsNotEmpty()
  @IsInt()
  employeeId: number;

  @IsNotEmpty()
  @IsString()
  photoPath: string;
}
