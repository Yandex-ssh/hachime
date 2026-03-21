import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('internships')
export class Internship {
  @PrimaryGeneratedColumn()
  internship_id: number;

  @Column({ length: 255 })
  company_name: string;

  @Column({ length: 255 })
  role_title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({
    type: 'enum',
    enum: ['On-site', 'Hybrid', 'Remote'],
    nullable: true,
  })
  work_type: 'On-site' | 'Hybrid' | 'Remote' | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  duration: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stipend_min: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  stipend_max: number | null;

  @Column({ type: 'date', nullable: true })
  deadline: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  requirements: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  required_subject_ids: number[] | null;

  @Column({ type: 'text', nullable: true })
  company_logo_url: string | null;

  @Column({ type: 'text', nullable: true })
  apply_url: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  posted_at: Date;
}

