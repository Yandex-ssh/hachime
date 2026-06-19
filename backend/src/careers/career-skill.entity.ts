import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Career } from './career.entity';
import { Skill } from '../skills/skill.entity';

@Entity('career_skills')
@Unique(['career_id', 'skill_id'])
export class CareerSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  career_id: number;

  @ManyToOne(() => Career, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'career_id' })
  career: Career;

  @Column()
  skill_id: number;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    nullable: true,
  })
  priority: 'low' | 'medium' | 'high' | null;
}
