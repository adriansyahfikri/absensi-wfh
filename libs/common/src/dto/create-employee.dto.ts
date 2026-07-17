import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Payload for POST /employees (admin only).
 * Creates the HR record and its login account in one operation.
 * `status` is not accepted here — new employees always start ACTIVE
 * (set server-side), so the client cannot create an inactive employee.
 */
export class CreateEmployeeDto {
  // --- HR profile ---
  @IsNotEmpty()
  @IsString()
  employeeCode: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsNotEmpty()
  @IsString()
  department: string;

  @IsEmail()
  email: string;

  // --- login credentials for the created account ---
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
