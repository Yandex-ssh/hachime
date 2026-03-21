import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../entities/subject.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
  ) {}

  async list(filters?: { program_id?: number; max_year_level?: number }) {
    const where: string[] = [];
    const params: any[] = [];

    if (filters?.program_id != null) {
      where.push('s.program_id = ?');
      params.push(filters.program_id);
    }
    if (filters?.max_year_level != null) {
      where.push('(s.year_level IS NULL OR s.year_level <= ?)');
      params.push(filters.max_year_level);
    }

    const sql = `
      SELECT s.subject_id, s.subject_code, s.subject_name, s.program_id, s.year_level, s.semester, s.category
      FROM subjects s
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY s.year_level ASC, s.semester ASC, s.subject_name ASC
      LIMIT 2000
    `;

    return this.subjectsRepository.query(sql, params);
  }
}

