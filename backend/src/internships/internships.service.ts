import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from '../entities/internship.entity';

@Injectable()
export class InternshipsService {
  constructor(
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
  ) {}

  async list(filters?: {
    q?: string;
    work_type?: 'On-site' | 'Hybrid' | 'Remote';
    is_active?: boolean;
  }) {
    const where: string[] = [];
    const params: any[] = [];

    const isActive = filters?.is_active ?? true;
    where.push('i.is_active = ?');
    params.push(isActive);

    if (filters?.work_type) {
      where.push('i.work_type = ?');
      params.push(filters.work_type);
    }
    if (filters?.q) {
      where.push(
        '(i.role_title LIKE ? OR i.company_name LIKE ? OR i.description LIKE ?)',
      );
      params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
    }

    const sql = `
      SELECT i.*
      FROM internships i
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY i.posted_at DESC, i.internship_id DESC
      LIMIT 200
    `;

    return this.internshipsRepository.query(sql, params);
  }

  async getById(internshipId: number) {
    const rows = await this.internshipsRepository.query(
      'SELECT * FROM internships WHERE internship_id = ? LIMIT 1',
      [internshipId],
    );
    return rows[0] ?? null;
  }

  async toggleSave(studentId: number, internshipId: number) {
    const existing = await this.internshipsRepository.query(
      'SELECT id FROM student_saved_internships WHERE student_id = ? AND internship_id = ? LIMIT 1',
      [studentId, internshipId],
    );
    if (existing[0]) {
      await this.internshipsRepository.query(
        'DELETE FROM student_saved_internships WHERE student_id = ? AND internship_id = ?',
        [studentId, internshipId],
      );
      return { saved: false };
    }

    await this.internshipsRepository.query(
      'INSERT INTO student_saved_internships (student_id, internship_id) VALUES (?, ?)',
      [studentId, internshipId],
    );
    return { saved: true };
  }

  async listSaved(studentId: number) {
    return this.internshipsRepository.query(
      `SELECT i.*
       FROM student_saved_internships si
       JOIN internships i ON i.internship_id = si.internship_id
       WHERE si.student_id = ?
       ORDER BY si.saved_at DESC`,
      [studentId],
    );
  }
}

