import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AUTH_PATTERNS, LoginDto } from '@app/common';
import { UserService } from './user.service';

@Controller()
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(AUTH_PATTERNS.VALIDATE_USER)
  validateUser(@Payload() dto: LoginDto) {
    return this.userService.validateCredentials(dto.username, dto.password);
  }
}
