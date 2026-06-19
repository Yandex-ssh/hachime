import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Subject } from './subject.entity';
import { Skill } from './skill.entity';

@Entity('subject_skills')
@Unique(['subject_id', 'skill_id'])
export class SubjectSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject_id: number;

  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column()
  skill_id: number;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @Column({ type: 'int', default: 5 })
  weight: number; // Importance or mastery points (1-10)
}
