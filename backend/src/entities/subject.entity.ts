import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Program } from './program.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  subject_id: number;

  @Column({ length: 20, nullable: true })
  subject_code: string;

  @Column({ length: 255 })
  subject_name: string;

  @Column({ nullable: true })
  program_id: number;

  @ManyToOne(() => Program, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ type: 'int', nullable: true })
  year_level: number;

  @Column({ type: 'int', nullable: true })
  semester: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}

