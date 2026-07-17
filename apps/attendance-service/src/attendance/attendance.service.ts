import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { Between, Repository } from 'typeorm';
import { CheckInDto, CheckOutDto, QueryAttendanceDto } from '@app/common';
import { Attendance } from '../entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  async checkIn(dto: CheckInDto): Promise<Attendance> {
    const { start, end } = this.getDayRange(new Date());
    const existing = await this.attendanceRepo.findOne({
      where: { employeeId: dto.employeeId, checkInTime: Between(start, end) },
    });
    if (existing) {
      throw new RpcException({
        statusCode: 409,
        message: 'Already checked in today',
      });
    }

    const attendance = this.attendanceRepo.create({
      employeeId: dto.employeeId,
      checkInTime: new Date(),
      checkInPhotoPath: dto.photoPath,
      checkOutTime: null,
    });
    return this.attendanceRepo.save(attendance);
  }

  async checkOut(dto: CheckOutDto): Promise<Attendance> {
    const { start, end } = this.getDayRange(new Date());
    const attendance = await this.attendanceRepo.findOne({
      where: { employeeId: dto.employeeId, checkInTime: Between(start, end) },
    });
    if (!attendance) {
      throw new RpcException({
        statusCode: 404,
        message: 'No check-in found for today',
      });
    }
    if (attendance.checkOutTime) {
      throw new RpcException({
        statusCode: 409,
        message: 'Already checked out today',
      });
    }

    attendance.checkOutTime = new Date();
    return this.attendanceRepo.save(attendance);
  }

  findByEmployee(employeeId: number): Promise<Attendance[]> {
    return this.attendanceRepo.find({
      where: { employeeId },
      order: { checkInTime: 'DESC' },
    });
  }

  findAll(query: QueryAttendanceDto): Promise<Attendance[]> {
    const qb = this.attendanceRepo.createQueryBuilder('attendance');

    if (query.employeeId) {
      qb.andWhere('attendance.employeeId = :employeeId', {
        employeeId: query.employeeId,
      });
    }
    if (query.date) {
      const { start, end } = this.getDayRange(new Date(query.date));
      qb.andWhere('attendance.checkInTime BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    qb.orderBy('attendance.checkInTime', 'DESC');
    return qb.getMany();
  }

  private getDayRange(date: Date): { start: Date; end: Date } {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
}
