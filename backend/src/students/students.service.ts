import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { SaveSubjectsDto } from './dto/save-subjects.dto';
import { SaveSubjectsByNameDto } from './dto/save-subjects-by-name.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetCareerGoalDto } from './dto/set-career-goal.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async saveSubjectsByName(
    studentId: number,
    dto: SaveSubjectsByNameDto,
  ) {
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
      [studentId]
    );

    const set = new Set<number>([
      ...(finished_subject_ids ?? []),
      ...(liked_subject_ids ?? []),
    ]);

    for (const subjectId of set) {
      const isFinished = (finished_subject_ids ?? []).includes(subjectId);
      const isLiked = (liked_subject_ids ?? []).includes(subjectId);
      await this.studentsRepository.query(
        'INSERT INTO student_subjects (student_id, subject_id, is_finished, is_liked) VALUES (?, ?, ?, ?)',
        [studentId, subjectId, isFinished, isLiked],
      );
    }

    return { message: 'Subjects saved successfully' };
  }

  async getProfile(studentId: number) {
    const student = await this.studentsRepository.findOne({
      where: { student_id: studentId },
      relations: ['program'],
    });

    if (!student) {
      return null;
    }

    // Get finished and liked subjects
    const finishedSubjects = await this.studentsRepository.query(
      `SELECT s.subject_id, s.subject_name, ss.is_liked 
       FROM student_subjects ss
       JOIN subjects s ON ss.subject_id = s.subject_id
       WHERE ss.student_id = ? AND ss.is_finished = true`,
      [studentId]
    );

    return {
      student_id: student.student_id,
      name: student.name,
      student_number: student.student_number,
      program: student.program?.program_name,
      year_level: student.year_level,
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
    const [{ total = 0 } = {}] = await this.studentsRepository.query(
      'SELECT COUNT(*) as total FROM subjects',
    );

    let careerGoal:
      | {
          career_id: number;
          title: string;
          icon: string | null;
          progress: { completed: number; total: number; percent: number };
          gap: { missing_subjects: { subject_id: number; subject_name: string }[] };
        }
      | null = null;

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
      const completed = (requiredSubjects as { subject_id: number; subject_name: string }[]).filter(
        (r) => finishedIds.has(r.subject_id),
      ).length;
      const totalRequired = requiredSubjects.length;
      const percent = totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 0;

      const missingSubjects = (requiredSubjects as {
        subject_id: number;
        subject_name: string;
      }[]).filter((r) => !finishedIds.has(r.subject_id));

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
      program_id: student.program_id ?? undefined,
      year_level: student.year_level ?? undefined,
      program: student.program?.program_name,
      program_code: student.program?.program_code,
      progress: {
        finishedSubjects: Number(finished) || 0,
        totalSubjects: Number(total) || 0,
      },
      career_goal: careerGoal,
    };
  }

  async setCareerGoal(studentId: number, dto: SetCareerGoalDto) {
    const student = await this.studentsRepository.findOne({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const value = dto.target_career_id === undefined ? undefined : dto.target_career_id;
    await this.studentsRepository.update(
      studentId,
      { target_career_id: value ?? null } as unknown as Partial<Student>,
    );

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

    if (Object.keys(patch).length > 0) {
      await this.studentsRepository.update(studentId, patch);
    }

    return this.getMeProfile(studentId);
  }

  async changePassword(studentId: number, dto: ChangePasswordDto) {
    const student = await this.studentsRepository.findOne({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const ok = await bcrypt.compare(dto.current_password, student.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const password_hash = await bcrypt.hash(dto.new_password, 10);
    await this.studentsRepository.update(studentId, { password_hash });

    return { message: 'Password updated successfully' };
  }
}