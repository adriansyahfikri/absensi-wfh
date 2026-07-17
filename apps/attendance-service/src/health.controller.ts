import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class HealthController {
  @MessagePattern({ cmd: 'health.ping' })
  ping() {
    return { status: 'ok', service: 'attendance-service' };
  }
}
