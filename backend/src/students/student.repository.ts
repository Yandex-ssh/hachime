import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Student } from './student.entity';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) {}

  async findOne(options: any): Promise<Student | null> {
    return this.repo.findOne(options);
  }

  async update(id: number, data: any) {
    return this.repo.update(id, data);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<Student> {
    return this.repo.createQueryBuilder(alias);
  }

  create(data: any): Student {
    return this.repo.create(data) as any;
  }

  async save(student: Student): Promise<Student> {
    return this.repo.save(student);
  }

  async deleteStudentSubjects(studentId: number): Promise<void> {
    await this.repo.query(
      'DELETE FROM student_subjects WHERE student_id = ?',
      [studentId],
    );
  }

  async findSubjectsByNames(names: string[]): Promise<{ subject_id: number; subject_name: string }[]> {
    const placeholders = names.map(() => '?').join(',');
    return this.repo.query(
      `SELECT subject_id, subject_name FROM subjects WHERE subject_name IN (${placeholders})`,
      names,
    );
  }

  async bulkInsertStudentSubjects(
    studentId: number,
    finishedIds: number[],
    likedIds: number[],
    allIdsSet: Set<number>,
  ): Promise<void> {
    const values: unknown[] = [];
    const placeholders: string[] = [];
    for (const subjectId of allIdsSet) {
      const isFinished = finishedIds.includes(subjectId) ? 1 : 0;
      const isLiked = likedIds.includes(subjectId) ? 1 : 0;
      placeholders.push('(?, ?, ?, ?)');
      values.push(studentId, subjectId, isFinished, isLiked);
    }
    await this.repo.query(
      `INSERT INTO student_subjects (student_id, subject_id, is_finished, is_liked) VALUES ${placeholders.join(', ')}`,
      values,
    );
  }

  async getFinishedSubjectsWithLikes(studentId: number): Promise<{ subject_id: number; subject_name: string; is_liked: boolean }[]> {
    return this.repo.query(
      `SELECT s.subject_id, s.subject_name, ss.is_liked 
       FROM student_subjects ss
       JOIN subjects s ON ss.subject_id = s.subject_id
       WHERE ss.student_id = ? AND ss.is_finished = true`,
      [studentId],
    );
  }

  async countFinishedSubjects(studentId: number): Promise<{ finished: number }[]> {
    return this.repo.query(
      'SELECT COUNT(*) as finished FROM student_subjects WHERE student_id = ? AND is_finished = true',
      [studentId],
    );
  }

  async countSubjectsByProgramAndYear(programId: number, yearLevel: number): Promise<{ total: number }[]> {
    return this.repo.query(
      `SELECT COUNT(*) as total FROM subjects
       WHERE program_id = ?
         AND year_level <= ?`,
      [programId, yearLevel],
    );
  }

  async countAllSubjects(): Promise<{ total: number }[]> {
    return this.repo.query('SELECT COUNT(*) as total FROM subjects');
  }

  async getRequiredSubjectsForCareer(careerId: number): Promise<{ subject_id: number; subject_name: string }[]> {
    return this.repo.query(
      `SELECT cs.subject_id, s.subject_name
       FROM career_subjects cs
       JOIN subjects s ON cs.subject_id = s.subject_id
       WHERE cs.career_id = ? AND cs.is_required = true`,
      [careerId],
    );
  }

  async getFinishedSubjectIds(studentId: number): Promise<{ subject_id: number }[]> {
    return this.repo.query(
      'SELECT subject_id FROM student_subjects WHERE student_id = ? AND is_finished = true',
      [studentId],
    );
  }

  async getSkillsForCareer(careerId: number): Promise<{ skill_id: number; skill_name: string; category: string; learning_resource_url: string | null; expanded_skills: string | null }[]> {
    return this.repo.query(
      `SELECT 
         s.skill_id,
         s.skill_name,
         s.category,
         s.learning_resource_url,
         s.expanded_skills
       FROM career_skills cs
       JOIN skills s ON s.skill_id = cs.skill_id
       WHERE cs.career_id = ?`,
      [careerId],
    );
  }

  async getSubjectSkillProgress(studentId: number, careerId: number): Promise<{ skill_id: number; earned_weight: string; total_weight: string }[]> {
    return this.repo.query(
      `SELECT 
         cs.skill_id,
         SUM(CASE WHEN ss.is_finished = true THEN (ssk.weight * (CASE WHEN ss.is_liked THEN 1.5 ELSE 1 END)) ELSE 0 END) AS earned_weight,
         SUM(ssk.weight * (CASE WHEN ss.is_liked THEN 1.5 ELSE 1 END)) AS total_weight
       FROM career_subjects csub
       JOIN subject_skills ssk ON ssk.subject_id = csub.subject_id
       JOIN career_skills cs ON cs.skill_id = ssk.skill_id AND cs.career_id = csub.career_id
       LEFT JOIN student_subjects ss ON ss.subject_id = csub.subject_id AND ss.student_id = ?
       WHERE csub.career_id = ? AND csub.is_required = true
       GROUP BY cs.skill_id`,
      [studentId, careerId],
    );
  }

  async getCareerById(careerId: number): Promise<any[]> {
    return this.repo.query(
      `SELECT career_id, title, icon, description, salary_min, salary_max, growth_rate, demand_level, job_examples
       FROM careers WHERE career_id = ? LIMIT 1`,
      [careerId],
    );
  }

  async getSkillNamesForCareer(careerId: number): Promise<{ skill_name: string }[]> {
    return this.repo.query(
      `SELECT s.skill_name
       FROM career_skills cs
       JOIN skills s ON s.skill_id = cs.skill_id
       WHERE cs.career_id = ?`,
      [careerId],
    );
  }

  async getRequiredSubjectsForRoadmap(careerId: number): Promise<{ subject_id: number; subject_name: string; year_level: number; semester: number | null }[]> {
    return this.repo.query(
      `SELECT s.subject_id, s.subject_name, s.year_level, s.semester
       FROM career_subjects cs
       JOIN subjects s ON s.subject_id = cs.subject_id
       WHERE cs.career_id = ? AND cs.is_required = true
       ORDER BY s.year_level ASC, s.semester ASC, s.subject_name ASC`,
      [careerId],
    );
  }

  async getFinishedSubjectsList(studentId: number): Promise<{ subject_id: number; subject_name: string }[]> {
    return this.repo.query(
      `SELECT s.subject_id, s.subject_name
       FROM student_subjects ss
       JOIN subjects s ON s.subject_id = ss.subject_id
       WHERE ss.student_id = ? AND ss.is_finished = true
       ORDER BY s.year_level ASC, s.semester ASC, s.subject_name ASC`,
      [studentId],
    );
  }

  async getLikedSubjectsList(studentId: number): Promise<{ subject_id: number; subject_name: string }[]> {
    return this.repo.query(
      `SELECT s.subject_id, s.subject_name
       FROM student_subjects ss
       JOIN subjects s ON s.subject_id = ss.subject_id
       WHERE ss.student_id = ? AND ss.is_liked = true
       ORDER BY s.year_level ASC, s.semester ASC, s.subject_name ASC`,
      [studentId],
    );
  }
}
