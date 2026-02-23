import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Program } from './program.entity';

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

  @Column({ type: 'int', nullable: true })
  year_level: number;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;
}