import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// employeeId is a plain FK column, not a TypeORM relation — the Employee
// entity class belongs to employee-service, and this service must not
// import across the service boundary even though they share a database.
@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @Column({ type: 'datetime' })
  checkInTime: Date;

  @Column()
  checkInPhotoPath: string;

  @Column({ type: 'datetime', nullable: true })
  checkOutTime: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
