import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Student } from '../entities/student.entity';
import { Subject } from '../entities/subject.entity';
import { StudentSubject } from '../entities/student-subject.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
    @InjectRepository(StudentSubject)
    private readonly studentSubjectsRepository: Repository<StudentSubject>,
    private readonly jwtService: JwtService,
  ) {}

  getStudentIdFromAuthHeader(authHeader?: string): number {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify<{ sub: number }>(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async setFinishedSubjectsForStudent(studentId: number, subjectNames: string[]) {
    const student = await this.studentsRepository.findOne({ where: { student_id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Ensure Subject rows exist for all provided names (scoped by program if available)
    const existingSubjects = await this.subjectsRepository.find({
      where: {
        subject_name: In(subjectNames),
        program_id: student.program_id ?? null,
      },
    });

    const existingByName = new Map(
      existingSubjects.map((s) => [s.subject_name, s]),
    );

    const subjectsToSave: Subject[] = [];

    for (const name of subjectNames) {
      if (!existingByName.has(name)) {
        const subject = this.subjectsRepository.create({
          subject_name: name,
          program_id: student.program_id ?? null,
          year_level: student.year_level ?? null,
        });
        subjectsToSave.push(subject);
        existingByName.set(name, subject);
      }
    }

    if (subjectsToSave.length > 0) {
      await this.subjectsRepository.save(subjectsToSave);
    }

    const allSubjects = Array.from(existingByName.values());
    const subjectIds = allSubjects.map((s) => s.subject_id);

    // Load existing StudentSubject records for this student
    const existingStudentSubjects = await this.studentSubjectsRepository.find({
      where: { student_id: studentId },
    });

    const existingBySubjectId = new Map(
      existingStudentSubjects.map((ss) => [ss.subject_id, ss]),
    );

    const toSave: StudentSubject[] = [];

    for (const subject of allSubjects) {
      const existing = existingBySubjectId.get(subject.subject_id);
      if (existing) {
        existing.is_finished = true;
        existing.completed_at = existing.completed_at ?? new Date();
        toSave.push(existing);
      } else {
        const ss = this.studentSubjectsRepository.create({
          student_id: studentId,
          subject_id: subject.subject_id,
          is_finished: true,
          is_liked: false,
          completed_at: new Date(),
        });
        toSave.push(ss);
      }
    }

    if (toSave.length > 0) {
      await this.studentSubjectsRepository.save(toSave);
    }

    // For any subjects not in the provided list, mark as not finished
    if (subjectIds.length > 0) {
      await this.studentSubjectsRepository.update(
        {
          student_id: studentId,
          subject_id: Not(In(subjectIds)),
        },
        {
          is_finished: false,
          completed_at: null,
        },
      );
    }
  }

  async setLikedSubjectsForStudent(studentId: number, subjectNames: string[]) {
    const student = await this.studentsRepository.findOne({ where: { student_id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Ensure Subject rows exist (same logic as finished)
    const existingSubjects = await this.subjectsRepository.find({
      where: {
        subject_name: In(subjectNames),
        program_id: student.program_id ?? null,
      },
    });

    const existingByName = new Map(
      existingSubjects.map((s) => [s.subject_name, s]),
    );

    const subjectsToSave: Subject[] = [];

    for (const name of subjectNames) {
      if (!existingByName.has(name)) {
        const subject = this.subjectsRepository.create({
          subject_name: name,
          program_id: student.program_id ?? null,
          year_level: student.year_level ?? null,
        });
        subjectsToSave.push(subject);
        existingByName.set(name, subject);
      }
    }

    if (subjectsToSave.length > 0) {
      await this.subjectsRepository.save(subjectsToSave);
    }

    const allSubjects = Array.from(existingByName.values());
    const subjectIds = allSubjects.map((s) => s.subject_id);

    // Load existing StudentSubject records
    const existingStudentSubjects = await this.studentSubjectsRepository.find({
      where: { student_id: studentId },
    });

    const existingBySubjectId = new Map(
      existingStudentSubjects.map((ss) => [ss.subject_id, ss]),
    );

    const toSave: StudentSubject[] = [];

    for (const subject of allSubjects) {
      const existing = existingBySubjectId.get(subject.subject_id);
      if (existing) {
        existing.is_liked = true;
        toSave.push(existing);
      } else {
        const ss = this.studentSubjectsRepository.create({
          student_id: studentId,
          subject_id: subject.subject_id,
          is_finished: false,
          is_liked: true,
        });
        toSave.push(ss);
      }
    }

    if (toSave.length > 0) {
      await this.studentSubjectsRepository.save(toSave);
    }

    // For any subjects not in the liked list, mark as not liked
    if (subjectIds.length > 0) {
      await this.studentSubjectsRepository.update(
        {
          student_id: studentId,
          subject_id: Not(In(subjectIds)),
        },
        {
          is_liked: false,
        },
      );
    }
  }
}

