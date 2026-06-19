import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Program } from '../programs/program.entity';
import { Career } from '../careers/career.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  student_id: number;

  @Column({ unique: true, length: 50 })
  student_number: string;

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true })
  program_id: number;

  @ManyToOne(() => Program, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ nullable: true })
  target_career_id: number;

  @ManyToOne(() => Career, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'target_career_id' })
  targetCareer: Career;

  @Column({ type: 'int', nullable: true })
  year_level: number;

  @Column({ type: 'int', nullable: true })
  semester: number;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'longtext', nullable: true })
  profile_picture_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reset_password_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_password_expires: Date | null;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;
}
