import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { DataSource, Repository } from 'typeorm';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeeDto,
  EmployeeStatus,
  PaginatedResult,
  Role,
} from '@app/common';
import { Employee } from '../entities/employee.entity';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    return this.dataSource.transaction(async (manager) => {
      const employeeRepo = manager.getRepository(Employee);
      const userRepo = manager.getRepository(User);

      const emailTaken = await employeeRepo.findOne({
        where: { email: dto.email },
      });
      if (emailTaken) {
        throw new RpcException({
          statusCode: 409,
          message: 'Email already in use',
        });
      }

      const usernameTaken = await userRepo.findOne({
        where: { username: dto.username },
      });
      if (usernameTaken) {
        throw new RpcException({
          statusCode: 409,
          message: 'Username already in use',
        });
      }

      const employee = await employeeRepo.save(
        employeeRepo.create({
          employeeCode: dto.employeeCode,
          fullName: dto.fullName,
          position: dto.position,
          department: dto.department,
          email: dto.email,
          status: EmployeeStatus.ACTIVE,
        }),
      );

      await userRepo.save(
        userRepo.create({
          username: dto.username,
          password: await this.userService.hashPassword(dto.password),
          role: Role.EMPLOYEE,
          employeeId: employee.id,
        }),
      );

      return employee;
    });
  }

  async findAll(query: QueryEmployeeDto): Promise<PaginatedResult<Employee>> {
    const qb = this.employeeRepo.createQueryBuilder('employee');

    if (query.status) {
      qb.andWhere('employee.status = :status', { status: query.status });
    }
    if (query.search) {
      qb.andWhere(
        '(employee.fullName LIKE :search OR employee.employeeCode LIKE :search OR employee.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await qb
      .orderBy('employee.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({ where: { id } });
    if (!employee) {
      throw new RpcException({
        statusCode: 404,
        message: 'Employee not found',
      });
    }
    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    return this.dataSource.transaction(async (manager) => {
      const employeeRepo = manager.getRepository(Employee);
      const userRepo = manager.getRepository(User);

      const employee = await employeeRepo.findOne({ where: { id } });
      if (!employee) {
        throw new RpcException({
          statusCode: 404,
          message: 'Employee not found',
        });
      }

      if (dto.email && dto.email !== employee.email) {
        const emailTaken = await employeeRepo.findOne({
          where: { email: dto.email },
        });
        if (emailTaken) {
          throw new RpcException({
            statusCode: 409,
            message: 'Email already in use',
          });
        }
      }

      Object.assign(employee, {
        employeeCode: dto.employeeCode ?? employee.employeeCode,
        fullName: dto.fullName ?? employee.fullName,
        position: dto.position ?? employee.position,
        department: dto.department ?? employee.department,
        email: dto.email ?? employee.email,
      });
      await employeeRepo.save(employee);

      if (dto.username || dto.password) {
        const user = await userRepo.findOne({ where: { employeeId: id } });
        if (user) {
          if (dto.username && dto.username !== user.username) {
            const usernameTaken = await userRepo.findOne({
              where: { username: dto.username },
            });
            if (usernameTaken) {
              throw new RpcException({
                statusCode: 409,
                message: 'Username already in use',
              });
            }
            user.username = dto.username;
          }
          if (dto.password) {
            user.password = await this.userService.hashPassword(dto.password);
          }
          await userRepo.save(user);
        }
      }

      return employee;
    });
  }

  async remove(id: number): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.status = EmployeeStatus.INACTIVE;
    return this.employeeRepo.save(employee);
  }
}
