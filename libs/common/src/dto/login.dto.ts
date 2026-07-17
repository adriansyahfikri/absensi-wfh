import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Payload for POST /auth/login.
 * The Gateway forwards username + password to the Employee Service for
 * credential validation, then issues a JWT if valid.
 */
export class LoginDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
