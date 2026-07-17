import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import {
  AUTH_PATTERNS,
  SERVICE_NAMES,
  LoginDto,
  JwtPayload,
  Role,
} from '@app/common';
import { sendTcp } from '../common/tcp.util';

interface ValidatedUser {
  id: number;
  username: string;
  role: Role;
  employeeId: number | null;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(SERVICE_NAMES.EMPLOYEE)
    private readonly employeeClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await sendTcp<ValidatedUser>(
      this.employeeClient,
      AUTH_PATTERNS.VALIDATE_USER,
      dto,
    );

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId,
    };

    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
