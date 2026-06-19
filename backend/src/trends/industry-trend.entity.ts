import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('industry_trends')
export class IndustryTrend {
  @PrimaryGeneratedColumn()
  trend_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  icon: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  growth_rate: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  demand_level: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary_min: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary_max: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  top_roles: string[] | null;

  @Column({ type: 'json', nullable: true })
  top_skills: string[] | null;

  @Column({ type: 'json', nullable: true })
  top_companies: string[] | null;

  @Column({ type: 'text', nullable: true })
  insight: string | null;

  @Column({ type: 'int', nullable: true })
  year: number | null;

  @Column({ type: 'json', nullable: true })
  program_ids: number[] | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
