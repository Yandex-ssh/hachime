import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('careers')
export class Career {
  @PrimaryGeneratedColumn()
  career_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 10, nullable: true })
  icon: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary_min: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary_max: number;

  @Column({ length: 10, nullable: true })
  growth_rate: string;

  @Column({
    type: 'enum',
    enum: ['Low', 'Medium', 'High', 'Very High'],
    nullable: true,
  })
  demand_level: string;

  @Column({ type: 'json', nullable: true })
  job_examples: string[];

  @CreateDateColumn()
  created_at: Date;
}
