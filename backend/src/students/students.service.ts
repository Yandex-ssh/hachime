import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { SaveSubjectsDto } from './dto/save-subjects.dto';
import { SaveSubjectsByNameDto } from './dto/save-subjects-by-name.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetCareerGoalDto } from './dto/set-career-goal.dto';
import { UpdateStudentAdminDto } from './dto/update-student-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async saveSubjectsByName(studentId: number, dto: SaveSubjectsByNameDto) {
    const { finished_subject_names, liked_subject_names } = dto;
    const allNames = [
      ...new Set([
        ...(finished_subject_names ?? []),
        ...(liked_subject_names ?? []),
      ]),
    ];
    if (allNames.length === 0) {
      await this.studentsRepository.query(
        'DELETE FROM student_subjects WHERE student_id = ?',
        [studentId],
      );
      return { message: 'Subjects saved successfully' };
    }

    const placeholders = allNames.map(() => '?').join(',');
    const rows = await this.studentsRepository.query(
      `SELECT subject_id, subject_name FROM subjects WHERE subject_name IN (${placeholders})`,
      allNames,
    );
    const nameToId = new Map<string, number>(
      (rows as { subject_id: number; subject_name: string }[]).map((r) => [
        r.subject_name,
        r.subject_id,
      ]),
    );

    const finishedIds: number[] = [];
    const likedIds: number[] = [];
    for (const name of finished_subject_names ?? []) {
      const id = nameToId.get(name);
      if (id != null) finishedIds.push(id);
    }
    for (const name of liked_subject_names ?? []) {
      const id = nameToId.get(name);
      if (id != null) likedIds.push(id);
    }

    return this.saveSubjects(studentId, {
      finished_subject_ids: finishedIds,
      liked_subject_ids: likedIds,
    });
  }

  async saveSubjects(studentId: number, saveSubjectsDto: SaveSubjectsDto) {
    const { finished_subject_ids, liked_subject_ids } = saveSubjectsDto;

    // Delete existing student_subjects entries for this student
    await this.studentsRepository.query(
      'DELETE FROM student_subjects WHERE student_id = ?',
      [studentId],
    );

    const set = new Set<number>([
      ...(finished_subject_ids ?? []),
      ...(liked_subject_ids ?? []),
    ]);

    if (set.size === 0) {
      return { message: 'Subjects saved successfully' };
    }

    // #5 – Bulk INSERT instead of N+1 individual queries
    const values: unknown[] = [];
    const placeholders: string[] = [];
    for (const subjectId of set) {
      const isFinished = (finished_subject_ids ?? []).includes(subjectId) ? 1 : 0;
      const isLiked = (liked_subject_ids ?? []).includes(subjectId) ? 1 : 0;
      placeholders.push('(?, ?, ?, ?)');
      values.push(studentId, subjectId, isFinished, isLiked);
    }
    await this.studentsRepository.query(
      `INSERT INTO student_subjects (student_id, subject_id, is_finished, is_liked) VALUES ${placeholders.join(', ')}`,
      values,
    );

    return { message: 'Subjects saved successfully' };
  }

  async getProfile(studentId: number) {
    // #11 – Fetch student once and pass to getMeProfile to avoid double query
    const student = await this.studentsRepository.findOne({
      where: { student_id: studentId },
      relations: ['program', 'targetCareer'],
    });
    if (!student) return null;

    const rich = await this.getMeProfile(studentId).catch(() => null);
    if (!rich) return null;

    // Get finished subjects with like info for the admin subject modal
    const finishedSubjects = await this.studentsRepository.query(
      `SELECT s.subject_id, s.subject_name, ss.is_liked 
       FROM student_subjects ss
       JOIN subjects s ON ss.subject_id = s.subject_id
       WHERE ss.student_id = ? AND ss.is_finished = true`,
      [studentId],
    );

    return {
      ...rich,
      isActive: student.isActive ?? true,
      finished_subjects: finishedSubjects,
    };
  }

  async getMeProfile(studentId: number) {
    const student = await this.studentsRepository.findOne({
      where: { student_id: studentId },
      relations: ['program', 'targetCareer'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [{ finished = 0 } = {}] = await this.studentsRepository.query(
      'SELECT COUNT(*) as finished FROM student_subjects WHERE student_id = ? AND is_finished = true',
      [studentId],
    );

    // Compute the cumulative subject goal using exactly what's currently in the DB
    // up to the END of the student's current year level.
    const yearLevel = student.year_level ?? null;
    const semester = student.semester ?? null;
    const programId = student.program_id ?? null;

    let total = 0;
    let semesterLabel: string | null = null;

    if (yearLevel && programId) {
      const [{ total: cumulativeTotal = 0 } = {}] =
        await this.studentsRepository.query(
          `SELECT COUNT(*) as total FROM subjects
           WHERE program_id = ?
             AND year_level <= ?`,
          [programId, yearLevel],
        );
      total = Number(cumulativeTotal) || 0;

      const ordinalYear =
        yearLevel === 1
          ? '1st'
          : yearLevel === 2
            ? '2nd'
            : yearLevel === 3
              ? '3rd'
              : `${yearLevel}th`;
      
      if (semester) {
        const ordinalSem = semester === 1 ? '1st' : '2nd';
        semesterLabel = `${ordinalYear} Year ${ordinalSem} Semester`;
      } else {
        semesterLabel = `${ordinalYear} Year`;
      }
    } else {
      const [{ total: allTotal = 0 } = {}] =
        await this.studentsRepository.query(
          'SELECT COUNT(*) as total FROM subjects',
        );
      total = Number(allTotal) || 0;
    }


    let careerGoal: {
      career_id: number;
      title: string;
      icon: string | null;
      progress: { completed: number; total: number; percent: number };
      gap: { missing_subjects: { subject_id: number; subject_name: string }[] };
    } | null = null;

    if (student.target_career_id && student.targetCareer) {
      const requiredSubjects = await this.studentsRepository.query(
        `SELECT cs.subject_id, s.subject_name
         FROM career_subjects cs
         JOIN subjects s ON cs.subject_id = s.subject_id
         WHERE cs.career_id = ? AND cs.is_required = true`,
        [student.target_career_id],
      );
      const finishedSubjects = await this.studentsRepository.query(
        'SELECT subject_id FROM student_subjects WHERE student_id = ? AND is_finished = true',
        [studentId],
      );
      const finishedIds = new Set(
        (finishedSubjects as { subject_id: number }[]).map((r) => r.subject_id),
      );
      const completed = (
        requiredSubjects as { subject_id: number; subject_name: string }[]
      ).filter((r) => finishedIds.has(r.subject_id)).length;
      const totalRequired = requiredSubjects.length;
      const percent =
        totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 0;

      const missingSubjects = (
        requiredSubjects as {
          subject_id: number;
          subject_name: string;
        }[]
      ).filter((r) => !finishedIds.has(r.subject_id));

      careerGoal = {
        career_id: student.targetCareer.career_id,
        title: student.targetCareer.title,
        icon: student.targetCareer.icon ?? null,
        progress: { completed, total: totalRequired, percent },
        gap: {
          missing_subjects: missingSubjects,
        },
      };
    }

    return {
      student_id: student.student_id,
      student_number: student.student_number,
      name: student.name,
      email: student.email ?? undefined,
      profile_picture_url: student.profile_picture_url ?? null,
      program_id: student.program_id ?? undefined,
      year_level: student.year_level ?? undefined,
      semester: student.semester ?? undefined,
      program: student.program?.program_name,
      program_code: student.program?.program_code,
      progress: {
        finishedSubjects: Number(finished) || 0,
        totalSubjects: total,
        semesterLabel,
      },
      career_goal: careerGoal,
    };
  }

  private mapPercentToLevel(
    percent: number,
  ): 'None' | 'Beginner' | 'Intermediate' | 'Advanced' {
    if (percent >= 80) return 'Advanced';
    if (percent >= 50) return 'Intermediate';
    if (percent >= 20) return 'Beginner';
    return 'None';
  }

  async getMySkills(studentId: number) {
    const me = await this.getMeProfile(studentId);
    const careerGoal = me.career_goal ?? null;

    if (!careerGoal) {
      return {
        target_career: null,
        derived_level: 'None',
        categories: [],
        message: 'Set a career goal to get a personalized skill plan.',
      };
    }

    const rows = await this.studentsRepository.query(
      `SELECT 
         s.skill_id,
         s.skill_name,
         s.category,
         s.learning_resource_url,
         s.expanded_skills
       FROM career_skills cs
       JOIN skills s ON s.skill_id = cs.skill_id
       WHERE cs.career_id = ?`,
      [careerGoal.career_id],
    );

    // Compute per-skill level based on finished subjects mapped to skills.
    // If subject_skills isn't populated, we fall back to a career-progress-derived level.
    const derivedLevel = this.mapPercentToLevel(careerGoal.progress.percent);
    const subjectSkillProgressRows = await this.studentsRepository.query(
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
      [studentId, careerGoal.career_id],
    );
    const perSkillLevel = new Map<
      number,
      'None' | 'Beginner' | 'Intermediate' | 'Advanced'
    >();
    const dynamicPriorityMap = new Map<number, 'high'|'medium'|'low'>();

    for (const r of subjectSkillProgressRows as any[]) {
      const total = Number(r.total_weight) || 0;
      if (total <= 0) continue;
      const earned = Number(r.earned_weight) || 0;
      const pct = Math.round((earned / total) * 100);
      
      perSkillLevel.set(Number(r.skill_id), this.mapPercentToLevel(pct));
      dynamicPriorityMap.set(Number(r.skill_id), pct < 100 ? 'high' : 'low');
    }

    const categoriesMap = new Map<
      string,
      {
        id: string;
        label: string;
        icon: string;
        skills: Array<{
          name: string;
          level: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
          priority: 'low' | 'medium' | 'high' | null;
          resource: string | null;
          expanded_skills?: any;
        }>;
      }
    >();

    const iconForCategory = (cat: string) => {
      const c = cat.toLowerCase();
      if (c.includes('program')) return '💻';
      if (c.includes('web')) return '🌐';
      if (c.includes('data')) return '📊';
      if (c.includes('tool') || c.includes('soft')) return '🛠️';
      return '⚡';
    };

    for (const r of rows as any[]) {
      const label = (r.category as string) || 'Other';
      const id = label.toLowerCase().replace(/\s+/g, '-');
      const existing = categoriesMap.get(id);
      const bucket =
        existing ??
        (() => {
          const created = {
            id,
            label,
            icon: iconForCategory(label),
            skills: [],
          };
          categoriesMap.set(id, created);
          return created;
        })();

      bucket.skills.push({
        name: r.skill_name,
        level: perSkillLevel.get(Number(r.skill_id)) ?? derivedLevel,
        priority: dynamicPriorityMap.get(Number(r.skill_id)) ?? 'medium',
        resource: r.learning_resource_url ?? null,
        expanded_skills: typeof r.expanded_skills === 'string' ? JSON.parse(r.expanded_skills) : r.expanded_skills,
      });
    }

    const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
    for (const bucket of categoriesMap.values()) {
        bucket.skills.sort((a, b) => {
            const pA = priorityWeight[a.priority as string] ?? 0;
            const pB = priorityWeight[b.priority as string] ?? 0;
            if (pA !== pB) return pB - pA;
            return a.name.localeCompare(b.name);
        });
    }

    return {
      target_career: careerGoal,
      derived_level: derivedLevel,
      categories: Array.from(categoriesMap.values()),
      gap: careerGoal.gap ?? { missing_subjects: [] },
    };
  }

  async getMyPathway(studentId: number) {
    const me = await this.getMeProfile(studentId);
    const careerGoal = me.career_goal ?? null;

    if (!careerGoal) {
      return {
        target_career: null,
        roadmap: [],
        message: 'Set a career goal to get a personalized roadmap.',
      };
    }

    const career = await this.studentsRepository.query(
      `SELECT career_id, title, icon, description, salary_min, salary_max, growth_rate, demand_level, job_examples
       FROM careers WHERE career_id = ? LIMIT 1`,
      [careerGoal.career_id],
    );

    const skills = await this.studentsRepository.query(
      `SELECT s.skill_name
       FROM career_skills cs
       JOIN skills s ON s.skill_id = cs.skill_id
       WHERE cs.career_id = ?`,
      [careerGoal.career_id],
    );

    const requiredSubjects = await this.studentsRepository.query(
      `SELECT s.subject_id, s.subject_name, s.year_level, s.semester
       FROM career_subjects cs
       JOIN subjects s ON s.subject_id = cs.subject_id
       WHERE cs.career_id = ? AND cs.is_required = true
       ORDER BY s.year_level ASC, s.semester ASC, s.subject_name ASC`,
      [careerGoal.career_id],
    );

    const finished = await this.studentsRepository.query(
      `SELECT subject_id
       FROM student_subjects
       WHERE student_id = ? AND is_finished = true`,
      [studentId],
    );
    const finishedSet = new Set((finished as any[]).map((r) => r.subject_id));

    const byYear = new Map<number, any[]>();
    for (const s of requiredSubjects as any[]) {
      const y = Number(s.year_level) || 0;
      const list = byYear.get(y) ?? [];
      list.push({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        semester: s.semester ?? null,
        completed: finishedSet.has(s.subject_id),
      });
      byYear.set(y, list);
    }

    const roadmap = Array.from(byYear.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year_level, subjects]) => {
        const completed = subjects.filter((x) => x.completed).length;
        const total = subjects.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          year_level,
          progress: { completed, total, percent },
          subjects,
        };
      });

    const c = (career as any[])[0] ?? null;
    const salaryRange =
      c && c.salary_min != null && c.salary_max != null
        ? { min: Number(c.salary_min), max: Number(c.salary_max) }
        : null;

    // Heuristic experience breakdown until a dedicated model exists.
    const salaryByExperience =
      salaryRange != null
        ? {
            entry: {
              min: Math.round(salaryRange.min * 0.8),
              max: Math.round(salaryRange.max * 0.7),
            },
            mid: {
              min: Math.round(salaryRange.min * 1.0),
              max: Math.round(salaryRange.max * 0.9),
            },
            senior: {
              min: Math.round(salaryRange.min * 1.2),
              max: Math.round(salaryRange.max * 1.1),
            },
          }
        : null;

    return {
      target_career: {
        career_id: c?.career_id ?? careerGoal.career_id,
        title: c?.title ?? careerGoal.title,
        icon: c?.icon ?? careerGoal.icon ?? null,
        description: c?.description ?? null,
        growth_rate: c?.growth_rate ?? null,
        demand_level: c?.demand_level ?? null,
        job_examples: c?.job_examples ?? [],
        salary_range: salaryRange,
        salary_by_experience: salaryByExperience,
        skills: (skills as any[]).map((s) => s.skill_name),
      },
      roadmap,
      gap: careerGoal.gap ?? { missing_subjects: [] },
    };
  }

  async setCareerGoal(studentId: number, dto: SetCareerGoalDto) {
    const student = await this.studentsRepository.findOne({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const value =
      dto.target_career_id === undefined ? undefined : dto.target_career_id;
    await this.studentsRepository.update(studentId, {
      target_career_id: value ?? null,
    } as unknown as Partial<Student>);

    return this.getMeProfile(studentId);
  }

  async updateProfile(studentId: number, dto: UpdateProfileDto) {
    const student = await this.studentsRepository.findOne({
      where: { student_id: studentId },
      relations: ['program'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const patch: Partial<Student> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.email !== undefined) patch.email = dto.email;
    if (dto.profile_picture_url !== undefined) {
      patch.profile_picture_url = dto.profile_picture_url;
    }
    if (dto.program_id !== undefined) patch.program_id = dto.program_id as any;
    if (dto.year_level !== undefined) patch.year_level = dto.year_level as any;
    if (dto.semester !== undefined) patch.semester = dto.semester as any;

    if (Object.keys(patch).length > 0) {
      await this.studentsRepository.update(studentId, patch);
    }

    return this.getMeProfile(studentId);
  }

  async getMySubjects(studentId: number) {
    const finished = await this.studentsRepository.query(
      `SELECT s.subject_id, s.subject_name
       FROM student_subjects ss
       JOIN subjects s ON s.subject_id = ss.subject_id
       WHERE ss.student_id = ? AND ss.is_finished = true
       ORDER BY s.year_level ASC, s.semester ASC, s.subject_name ASC`,
      [studentId],
    );

    const liked = await this.studentsRepository.query(
      `SELECT s.subject_id, s.subject_name
       FROM student_subjects ss
       JOIN subjects s ON s.subject_id = ss.subject_id
       WHERE ss.student_id = ? AND ss.is_liked = true
       ORDER BY s.year_level ASC, s.semester ASC, s.subject_name ASC`,
      [studentId],
    );

    return {
      finished_subjects: finished,
      liked_subjects: liked,
    };
  }

  async changePassword(studentId: number, dto: ChangePasswordDto) {
    const student = await this.studentsRepository.findOne({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const ok = await bcrypt.compare(
      dto.current_password,
      student.password_hash,
    );
    if (!ok) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const password_hash = await bcrypt.hash(dto.new_password, 10);
    await this.studentsRepository.update(studentId, { password_hash });

    return { message: 'Password updated successfully' };
  }

  async getAllStudentsAdmin(query?: string) {
    const qb = this.studentsRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.program', 'program')
      .leftJoinAndSelect('student.targetCareer', 'career')
      .where('student.isAdmin = :isAdmin', { isAdmin: false });

    if (query) {
      qb.andWhere('(student.name LIKE :query OR student.student_number LIKE :query OR student.email LIKE :query)', { query: `%${query}%` });
    }

    return qb.getMany();
  }

  // #8 – Use typed DTO instead of `any` to prevent privilege escalation
  async updateStudentAdmin(studentId: number, dto: UpdateStudentAdminDto) {
    const student = await this.studentsRepository.findOne({ where: { student_id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    await this.studentsRepository.update(studentId, dto as Partial<Student>);
    return this.getProfile(studentId);
  }

  // #10 – Renamed from deleteStudentAdmin; verb is more accurate
  async deactivateStudentAdmin(studentId: number) {
    const student = await this.studentsRepository.findOne({ where: { student_id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    await this.studentsRepository.update(studentId, { isActive: false } as any);
    return { message: 'Student deactivated' };
  }

  async deleteStudentPermanently(studentId: number) {
    const student = await this.studentsRepository.findOne({ where: { student_id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    await this.studentsRepository.delete(studentId);
    return { message: 'Student permanently deleted' };
  }

  async activateStudentAdmin(studentId: number) {
    const student = await this.studentsRepository.findOne({ where: { student_id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    
    await this.studentsRepository.update(studentId, { isActive: true } as any);
    return { message: 'Student activated successfully' };
  }

}
