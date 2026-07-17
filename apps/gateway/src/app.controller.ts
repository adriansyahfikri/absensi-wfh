import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SERVICE_NAMES } from '@app/common';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';

/**
 * GET /health
 * Confirms the whole stack is alive: the Gateway itself plus a live ping
 * to both microservices over TCP. If a service is down, its status shows
 * 'down' instead of crashing the request — so you can see exactly which
 * piece isn't up yet.
 */
@Controller('health')
export class AppController {
  constructor(
    @Inject(SERVICE_NAMES.EMPLOYEE)
    private readonly employeeClient: ClientProxy,
    @Inject(SERVICE_NAMES.ATTENDANCE)
    private readonly attendanceClient: ClientProxy,
  ) {}

  @Get()
  async check() {
    const ping = (client: ClientProxy) =>
      firstValueFrom(
        client.send<{ status: string }>({ cmd: 'health.ping' }, {}).pipe(
          timeout(2000),
          catchError(() => of({ status: 'down' })),
        ),
      );

    const [employeeService, attendanceService] = await Promise.all([
      ping(this.employeeClient),
      ping(this.attendanceClient),
    ]);

    return {
      gateway: { status: 'ok' },
      employeeService,
      attendanceService,
    };
  }
}
