import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Career } from './career.entity';
import { Subject } from '../subjects/subject.entity';

@Entity('career_subjects')
@Unique(['career_id', 'subject_id'])
export class CareerSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  career_id: number;

  @ManyToOne(() => Career, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'career_id' })
  career: Career;

  @Column()
  subject_id: number;

  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ type: 'int', default: 1 })
  weight: number;

  @Column({ type: 'boolean', default: true })
  is_required: boolean;
}
