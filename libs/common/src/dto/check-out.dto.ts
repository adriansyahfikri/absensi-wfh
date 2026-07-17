import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * Payload sent from Gateway → Attendance Service for check-out (optional feature).
 * `employeeId` comes from the JWT; the service finds today's open attendance
 * record for that employee and stamps check_out_time server-side.
 */
export class CheckOutDto {
  @IsNotEmpty()
  @IsInt()
  employeeId: number;
}
