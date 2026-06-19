import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Program } from '../programs/program.entity';
import { Career } from '../careers/career.entity';

@Entity('job_listings')
export class JobListing {
  @PrimaryGeneratedColumn()
  job_id: number;

  @Column({ length: 255 })
  company_name: string;

  @Column({ length: 255 })
  role_title: string;

  // Explicit column type avoids TypeORM inferring `Object` from `string | null`.
  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({
    type: 'enum',
    enum: ['On-site', 'Hybrid', 'Remote'],
    nullable: true,
  })
  work_type: 'On-site' | 'Hybrid' | 'Remote' | null;

  @Column({
    type: 'enum',
    enum: ['Full-time', 'Part-time', 'Contract'],
    default: 'Full-time',
  })
  employment_type: 'Full-time' | 'Part-time' | 'Contract';

  @Column({
    type: 'enum',
    enum: ['Entry-level', 'Junior', 'Mid', 'Senior'],
    default: 'Entry-level',
  })
  experience_level: 'Entry-level' | 'Junior' | 'Mid' | 'Senior';

  @Column({ type: 'int', nullable: true })
  program_id: number | null;

  @ManyToOne(() => Program, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ type: 'json', nullable: true })
  program_ids: number[] | null;

  @Column({ type: 'int', nullable: true })
  career_id: number | null;

  @ManyToOne(() => Career, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'career_id' })
  career: Career;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  requirements: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  required_subject_ids: number[] | null;

  @Column({ type: 'text', nullable: true })
  apply_url: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  posted_at: Date;

  @Column({ type: 'date', nullable: true })
  deadline: string | null;
}
