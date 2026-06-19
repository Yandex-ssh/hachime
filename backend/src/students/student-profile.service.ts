import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { SetCareerGoalDto } from './dto/set-career-goal.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Student } from './student.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentProfileService {
  constructor(private readonly studentRepository: StudentRepository) {}

  async getMeProfile(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { student_id: studentId },
      relations: ['program', 'targetCareer'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [{ finished = 0 } = {}] = await this.studentRepository.countFinishedSubjects(studentId);

    const yearLevel = student.year_level ?? null;
    const semester = student.semester ?? null;
    const programId = student.program_id ?? null;

    let total = 0;
    let semesterLabel: string | null = null;

    if (yearLevel && programId) {
      const [{ total: cumulativeTotal = 0 } = {}] =
        await this.studentRepository.countSubjectsByProgramAndYear(programId, yearLevel);
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
      const [{ total: allTotal = 0 } = {}] = await this.studentRepository.countAllSubjects();
      total = Number(allTotal) || 0;
    }

    let careerGoal: any = null;

    if (student.target_career_id && student.targetCareer) {
      const requiredSubjects = await this.studentRepository.getRequiredSubjectsForCareer(student.target_career_id);
      const finishedSubjects = await this.studentRepository.getFinishedSubjectIds(studentId);
      const finishedIds = new Set(finishedSubjects.map((r) => r.subject_id));
      
      const completed = requiredSubjects.filter((r) => finishedIds.has(r.subject_id)).length;
      const totalRequired = requiredSubjects.length;
      const percent = totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 0;
      const missingSubjects = requiredSubjects.filter((r) => !finishedIds.has(r.subject_id));

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

  async getProfile(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { student_id: studentId },
      relations: ['program', 'targetCareer'],
    });
    if (!student) return null;

    const rich = await this.getMeProfile(studentId).catch(() => null);
    if (!rich) return null;

    const finishedSubjects = await this.studentRepository.getFinishedSubjectsWithLikes(studentId);

    return {
      ...rich,
      isActive: student.isActive ?? true,
      finished_subjects: finishedSubjects,
    };
  }

  async setCareerGoal(studentId: number, dto: SetCareerGoalDto) {
    const student = await this.studentRepository.findOne({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const value = dto.target_career_id === undefined ? undefined : dto.target_career_id;
    await this.studentRepository.update(studentId, {
      target_career_id: value ?? null,
    } as unknown as Partial<Student>);

    return this.getMeProfile(studentId);
  }

  async updateProfile(studentId: number, dto: UpdateProfileDto) {
    const student = await this.studentRepository.findOne({
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
      await this.studentRepository.update(studentId, patch);
    }

    return this.getMeProfile(studentId);
  }

  async changePassword(studentId: number, dto: ChangePasswordDto) {
    const student = await this.studentRepository.findOne({
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
    await this.studentRepository.update(studentId, { password_hash });

    return { message: 'Password updated successfully' };
  }
}
