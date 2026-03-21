import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Program } from './program.entity';

@Entity('development_resources')
export class DevelopmentResource {
  @PrimaryGeneratedColumn()
  resource_id: number;

  @Column({
    type: 'enum',
    enum: ['Course', 'Certification', 'Roadmap', 'Article', 'Bootcamp'],
  })
  type: 'Course' | 'Certification' | 'Roadmap' | 'Article' | 'Bootcamp';

  @Column({ length: 255 })
  title: string;

  // Explicit column type avoids TypeORM inferring `Object` from `string | null`.
  @Column({ type: 'varchar', length: 255, nullable: true })
  provider: string | null;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: true })
  program_id: number | null;

  @ManyToOne(() => Program, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ type: 'json', nullable: true })
  skill_ids: number[] | null;

  @Column({
    type: 'enum',
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  })
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';

  @Column({
    type: 'enum',
    enum: ['Free', 'Paid', 'Freemium'],
    default: 'Free',
  })
  cost_type: 'Free' | 'Paid' | 'Freemium';

  @Column({ type: 'boolean', default: false })
  certificate_offered: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
