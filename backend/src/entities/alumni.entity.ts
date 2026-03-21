import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Program } from './program.entity';

@Entity('alumni')
export class Alumni {
  @PrimaryGeneratedColumn()
  alumni_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true })
  program_id: number | null;

  @ManyToOne(() => Program, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'program_id' })
  program: Program | null;

  @Column({ type: 'int', nullable: true })
  batch_year: number | null;

  @Column({ type: 'int', nullable: true })
  graduated_year: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_job_title: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_company: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  salary_range: string | null;

  @Column({ type: 'int', nullable: true })
  months_to_land_job: number | null;

  @Column({ type: 'json', nullable: true })
  favorite_subjects: string[] | null;

  @Column({ type: 'json', nullable: true })
  skills_used: string[] | null;

  @Column({ type: 'json', nullable: true })
  internships:
    | Array<{
        role_title?: string;
        company_name?: string;
        location?: string;
        year?: number;
      }>
    | null;

  @Column({ type: 'text', nullable: true })
  advice: string | null;

  @Column({ type: 'text', nullable: true })
  linkedin_url: string | null;

  @Column({ type: 'boolean', default: true })
  is_visible: boolean;

  @CreateDateColumn()
  created_at: Date;
}
