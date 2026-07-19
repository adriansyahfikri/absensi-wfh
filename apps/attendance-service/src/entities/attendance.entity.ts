import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
