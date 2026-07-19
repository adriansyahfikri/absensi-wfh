import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SERVICE_NAMES } from '@app/common';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';
import { Public } from './auth/decorators/public.decorator';

@Controller('health')
export class AppController {
  constructor(
    @Inject(SERVICE_NAMES.EMPLOYEE)
    private readonly employeeClient: ClientProxy,
    @Inject(SERVICE_NAMES.ATTENDANCE)
    private readonly attendanceClient: ClientProxy,
  ) {}

  @Public()
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
