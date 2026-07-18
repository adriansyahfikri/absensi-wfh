import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ClientProxy } from '@nestjs/microservices';
import {
  ATTENDANCE_PATTERNS,
  SERVICE_NAMES,
  QueryAttendanceDto,
  Role,
} from '@app/common';
import type { JwtPayload } from '@app/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { sendTcp } from '../common/tcp.util';

@Controller('attendance')
export class AttendanceController {
  constructor(
    @Inject(SERVICE_NAMES.ATTENDANCE)
    private readonly attendanceClient: ClientProxy,
  ) {}

  // Photo is stored here at the Gateway (see CONTEXT.md decision #5) —
  // only the resulting path is sent downstream over TCP, never the binary.
  @Roles(Role.EMPLOYEE)
  @Post('check-in')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  checkIn(
    @UploadedFile() photo: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!photo) {
      throw new BadRequestException('Photo proof is required for check-in');
    }
    return sendTcp(this.attendanceClient, ATTENDANCE_PATTERNS.CHECK_IN, {
      employeeId: user.employeeId,
      // Just the filename, not photo.path (an OS-specific disk path) — the
      // frontend builds the public URL as `${API_URL}/uploads/${photoPath}`.
      photoPath: photo.filename,
    });
  }

  @Roles(Role.EMPLOYEE)
  @Patch('check-out')
  checkOut(@CurrentUser() user: JwtPayload) {
    return sendTcp(this.attendanceClient, ATTENDANCE_PATTERNS.CHECK_OUT, {
      employeeId: user.employeeId,
    });
  }

  @Roles(Role.EMPLOYEE)
  @Get('me')
  findMine(@CurrentUser() user: JwtPayload) {
    return sendTcp(
      this.attendanceClient,
      ATTENDANCE_PATTERNS.FIND_BY_EMPLOYEE,
      user.employeeId,
    );
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: QueryAttendanceDto) {
    return sendTcp(this.attendanceClient, ATTENDANCE_PATTERNS.FIND_ALL, query);
  }
}
