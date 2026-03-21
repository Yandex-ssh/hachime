import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevelopmentResource } from '../entities/development-resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

type StudentBasics = {
  student_id: number;
  program_id: number | null;
  target_career_id: number | null;
};

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(DevelopmentResource)
    private readonly resourcesRepository: Repository<DevelopmentResource>,
  ) {}

  async list(filters?: {
    q?: string;
    type?: DevelopmentResource['type'];
    program_id?: number;
    difficulty?: DevelopmentResource['difficulty'];
    cost_type?: DevelopmentResource['cost_type'];
    is_active?: boolean;
  }) {
    const where: string[] = [];
    const params: any[] = [];

    const isActive = filters?.is_active ?? true;
    where.push('r.is_active = ?');
    params.push(isActive);

    if (filters?.type) {
      where.push('r.type = ?');
      params.push(filters.type);
    }
    if (filters?.program_id != null) {
      where.push('(r.program_id = ? OR r.program_id IS NULL)');
      params.push(filters.program_id);
    }
    if (filters?.difficulty) {
      where.push('r.difficulty = ?');
      params.push(filters.difficulty);
    }
    if (filters?.cost_type) {
      where.push('r.cost_type = ?');
      params.push(filters.cost_type);
    }
    if (filters?.q) {
      where.push(
        '(r.title LIKE ? OR r.provider LIKE ? OR r.description LIKE ?)',
      );
      params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
    }

    const sql = `
      SELECT r.*
      FROM development_resources r
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY r.created_at DESC, r.resource_id DESC
      LIMIT 200
    `;
    return this.resourcesRepository.query(sql, params);
  }

  async getById(resourceId: number) {
    const rows = await this.resourcesRepository.query(
      'SELECT * FROM development_resources WHERE resource_id = ? LIMIT 1',
      [resourceId],
    );
    return rows[0] ?? null;
  }

  async create(dto: CreateResourceDto) {
    const payload = {
      ...dto,
      skill_ids: dto.skill_ids ?? null,
      is_active: dto.is_active ?? true,
      certificate_offered: dto.certificate_offered ?? false,
    };
    const created = this.resourcesRepository.create(payload as any);
    return this.resourcesRepository.save(created);
  }

  async update(resourceId: number, dto: UpdateResourceDto) {
    await this.resourcesRepository.update(resourceId, {
      ...dto,
      skill_ids:
        dto.skill_ids === undefined ? undefined : (dto.skill_ids as any),
    } as any);
    return this.getById(resourceId);
  }

  async toggleSave(studentId: number, resourceId: number) {
    const existing = await this.resourcesRepository.query(
      'SELECT id FROM student_saved_resources WHERE student_id = ? AND resource_id = ? LIMIT 1',
      [studentId, resourceId],
    );
    if (existing[0]) {
      await this.resourcesRepository.query(
        'DELETE FROM student_saved_resources WHERE student_id = ? AND resource_id = ?',
        [studentId, resourceId],
      );
      return { saved: false };
    }

    await this.resourcesRepository.query(
      'INSERT INTO student_saved_resources (student_id, resource_id) VALUES (?, ?)',
      [studentId, resourceId],
    );
    return { saved: true };
  }

  async listSaved(studentId: number) {
    return this.resourcesRepository.query(
      `SELECT r.*
       FROM student_saved_resources sr
       JOIN development_resources r ON r.resource_id = sr.resource_id
       WHERE sr.student_id = ?
       ORDER BY sr.saved_at DESC`,
      [studentId],
    );
  }

  private scoreResource(args: {
    resource: any;
    student: StudentBasics;
    careerSkillIds: Set<number>;
  }) {
    const { resource, student, careerSkillIds } = args;
    let score = 0;

    if (student.program_id && resource.program_id === student.program_id)
      score += 15;

    const skills: number[] = Array.isArray(resource.skill_ids)
      ? resource.skill_ids
      : [];
    for (const sid of skills) {
      if (careerSkillIds.has(Number(sid))) score += 10;
    }

    // Prefer certs slightly when we have a career goal (helps employability).
    if (student.target_career_id && resource.type === 'Certification')
      score += 5;

    return score;
  }

  async recommendedForStudent(studentId: number) {
    const studentRows = await this.resourcesRepository.query(
      'SELECT student_id, program_id, target_career_id FROM students WHERE student_id = ? LIMIT 1',
      [studentId],
    );
    const student = (studentRows[0] ?? null) as StudentBasics | null;
    if (!student) return [];

    const careerSkillsRows =
      student.target_career_id != null
        ? await this.resourcesRepository.query(
            'SELECT skill_id FROM career_skills WHERE career_id = ?',
            [student.target_career_id],
          )
        : [];
    const careerSkillIds = new Set<number>(
      (careerSkillsRows as any[]).map((r) => Number(r.skill_id)),
    );

    // Candidate pool: active + (same program OR generic)
    const resources = await this.resourcesRepository.query(
      `SELECT *
       FROM development_resources
       WHERE is_active = true
         AND (program_id IS NULL OR program_id = ?)
       ORDER BY created_at DESC, resource_id DESC
       LIMIT 400`,
      [student.program_id ?? -1],
    );

    return (resources as any[])
      .map((resource) => ({
        ...resource,
        match_score: this.scoreResource({ resource, student, careerSkillIds }),
      }))
      .filter((r) => r.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 50);
  }
}
