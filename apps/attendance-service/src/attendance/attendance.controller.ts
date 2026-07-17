import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ATTENDANCE_PATTERNS,
  CheckInDto,
  CheckOutDto,
  QueryAttendanceDto,
} from '@app/common';
import { AttendanceService } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern(ATTENDANCE_PATTERNS.CHECK_IN)
  checkIn(@Payload() dto: CheckInDto) {
    return this.attendanceService.checkIn(dto);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.CHECK_OUT)
  checkOut(@Payload() dto: CheckOutDto) {
    return this.attendanceService.checkOut(dto);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.FIND_BY_EMPLOYEE)
  findByEmployee(@Payload() employeeId: number) {
    return this.attendanceService.findByEmployee(employeeId);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.FIND_ALL)
  findAll(@Payload() query: QueryAttendanceDto) {
    return this.attendanceService.findAll(query);
  }
}
