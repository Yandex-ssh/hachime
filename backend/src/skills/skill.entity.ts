import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  skill_id: number;

  @Column({ length: 100, unique: true })
  skill_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  learning_resource_url: string | null;

  @Column({ type: 'json', nullable: true })
  program_ids: number[] | null;

  @Column({ type: 'json', nullable: true })
  expanded_skills: any | null;

  @Column({ type: 'json', nullable: true })
  subject_ids: number[] | null;
}
