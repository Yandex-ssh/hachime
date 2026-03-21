import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobListing } from '../entities/job-listing.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

type StudentBasics = {
  student_id: number;
  program_id: number | null;
  target_career_id: number | null;
};

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobListing)
    private readonly jobsRepository: Repository<JobListing>,
  ) {}

  async list(filters?: {
    q?: string;
    program_id?: number;
    career_id?: number;
    work_type?: 'On-site' | 'Hybrid' | 'Remote';
    is_active?: boolean;
  }) {
    const where: string[] = [];
    const params: any[] = [];

    const isActive = filters?.is_active ?? true;
    where.push('j.is_active = ?');
    params.push(isActive);

    if (filters?.program_id != null) {
      where.push('(j.program_id = ? OR j.program_id IS NULL)');
      params.push(filters.program_id);
    }
    if (filters?.career_id != null) {
      where.push('(j.career_id = ? OR j.career_id IS NULL)');
      params.push(filters.career_id);
    }
    if (filters?.work_type) {
      where.push('j.work_type = ?');
      params.push(filters.work_type);
    }
    if (filters?.q) {
      where.push(
        '(j.role_title LIKE ? OR j.company_name LIKE ? OR j.description LIKE ?)',
      );
      params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
    }

    const sql = `
      SELECT 
        j.*
      FROM job_listings j
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY j.posted_at DESC, j.job_id DESC
      LIMIT 200
    `;

    return this.jobsRepository.query(sql, params);
  }

  async getById(jobId: number) {
    const rows = await this.jobsRepository.query(
      'SELECT * FROM job_listings WHERE job_id = ? LIMIT 1',
      [jobId],
    );
    return rows[0] ?? null;
  }

  async create(dto: CreateJobDto) {
    const payload = {
      ...dto,
      requirements: dto.requirements ?? null,
      required_subject_ids: dto.required_subject_ids ?? null,
      is_active: dto.is_active ?? true,
    };
    const created = this.jobsRepository.create(payload as any);
    return this.jobsRepository.save(created);
  }

  async update(jobId: number, dto: UpdateJobDto) {
    await this.jobsRepository.update(jobId, {
      ...dto,
      requirements:
        dto.requirements === undefined ? undefined : (dto.requirements as any),
      required_subject_ids:
        dto.required_subject_ids === undefined
          ? undefined
          : (dto.required_subject_ids as any),
    } as any);
    return this.getById(jobId);
  }

  async toggleSave(studentId: number, jobId: number) {
    const existing = await this.jobsRepository.query(
      'SELECT id FROM student_saved_jobs WHERE student_id = ? AND job_id = ? LIMIT 1',
      [studentId, jobId],
    );
    if (existing[0]) {
      await this.jobsRepository.query(
        'DELETE FROM student_saved_jobs WHERE student_id = ? AND job_id = ?',
        [studentId, jobId],
      );
      return { saved: false };
    }

    await this.jobsRepository.query(
      'INSERT INTO student_saved_jobs (student_id, job_id) VALUES (?, ?)',
      [studentId, jobId],
    );
    return { saved: true };
  }

  async listSaved(studentId: number) {
    return this.jobsRepository.query(
      `SELECT j.*
       FROM student_saved_jobs sj
       JOIN job_listings j ON j.job_id = sj.job_id
       WHERE sj.student_id = ?
       ORDER BY sj.saved_at DESC`,
      [studentId],
    );
  }

  private scoreJob(args: {
    job: any;
    student: StudentBasics;
    finishedSubjectIds: Set<number>;
    likedSubjectIds: Set<number>;
  }) {
    const { job, student, finishedSubjectIds, likedSubjectIds } = args;

    let score = 0;
    if (student.target_career_id && job.career_id === student.target_career_id)
      score += 50;
    if (student.program_id && job.program_id === student.program_id)
      score += 30;

    const required: number[] = Array.isArray(job.required_subject_ids)
      ? job.required_subject_ids
      : [];

    for (const sid of required) {
      if (finishedSubjectIds.has(Number(sid))) score += 6;
      if (likedSubjectIds.has(Number(sid))) score += 2;
    }

    // Freshness boost (recent postings bubble up).
    if (job.posted_at) score += 5;

    return score;
  }

  async recommendedForStudent(studentId: number) {
    const studentRows = await this.jobsRepository.query(
      'SELECT student_id, program_id, target_career_id FROM students WHERE student_id = ? LIMIT 1',
      [studentId],
    );
    const student = (studentRows[0] ?? null) as StudentBasics | null;
    if (!student) return [];

    const finishedRows = await this.jobsRepository.query(
      'SELECT subject_id FROM student_subjects WHERE student_id = ? AND is_finished = true',
      [studentId],
    );
    const likedRows = await this.jobsRepository.query(
      'SELECT subject_id FROM student_subjects WHERE student_id = ? AND is_liked = true',
      [studentId],
    );
    const finishedSet = new Set<number>(
      (finishedRows as any[]).map((r) => Number(r.subject_id)),
    );
    const likedSet = new Set<number>(
      (likedRows as any[]).map((r) => Number(r.subject_id)),
    );

    // Candidate pool: active + (same program OR same career OR generic)
    const jobs = await this.jobsRepository.query(
      `SELECT *
       FROM job_listings
       WHERE is_active = true
         AND (program_id IS NULL OR program_id = ? OR career_id IS NULL OR career_id = ?)
       ORDER BY posted_at DESC, job_id DESC
       LIMIT 300`,
      [student.program_id ?? -1, student.target_career_id ?? -1],
    );

    return (jobs as any[])
      .map((job) => ({
        ...job,
        match_score: this.scoreJob({
          job,
          student,
          finishedSubjectIds: finishedSet,
          likedSubjectIds: likedSet,
        }),
      }))
      .filter((j) => j.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 50);
  }
}
