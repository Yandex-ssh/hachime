import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn()
  program_id: number;

  @Column({ unique: true, length: 20 })
  program_code: string;

  @Column({ length: 255 })
  program_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 4 })
  total_years: number;

  @CreateDateColumn()
  created_at: Date;
}
