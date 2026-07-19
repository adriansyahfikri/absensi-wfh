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
  EMPLOYEE_PATTERNS,
  SERVICE_NAMES,
  QueryAttendanceDto,
  Role,
} from '@app/common';
import type { JwtPayload, PaginatedResult } from '@app/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { sendTcp } from '../common/tcp.util';

interface EmployeeIdOnly {
  id: number;
}

@Controller('attendance')
export class AttendanceController {
  constructor(
    @Inject(SERVICE_NAMES.ATTENDANCE)
    private readonly attendanceClient: ClientProxy,
    @Inject(SERVICE_NAMES.EMPLOYEE)
    private readonly employeeClient: ClientProxy,
  ) {}

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
  async findAll(@Query() query: QueryAttendanceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    let employeeIds: number[] | undefined;
    
    if (query.employeeSearch) {
      const matches = await sendTcp<PaginatedResult<EmployeeIdOnly>>(
        this.employeeClient,
        EMPLOYEE_PATTERNS.FIND_ALL,
        { search: query.employeeSearch, page: 1, limit: 100 },
      );
      if (matches.data.length === 0) {
        return { data: [], total: 0, page, limit };
      }
      employeeIds = matches.data.map((employee) => employee.id);
    }

    return sendTcp(this.attendanceClient, ATTENDANCE_PATTERNS.FIND_ALL, {
      date: query.date,
      employeeId: query.employeeId,
      employeeIds,
      page,
      limit,
    });
  }
}
