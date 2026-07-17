import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '@app/common';
import { Employee } from './employee.entity';

// employeeId is nullable — an admin account can exist without an HR record.
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  // Never selected by default; UserService.validateCredentials() is the
  // only place that explicitly selects it.
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role: Role;

  @Column({ nullable: true })
  employeeId: number | null;

  @OneToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
