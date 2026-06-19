import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { StudentProfileService } from './student-profile.service';
import { UpdateStudentAdminDto } from './dto/update-student-admin.dto';
import { Student } from './student.entity';

@Injectable()
export class StudentAdminService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly studentProfileService: StudentProfileService,
  ) {}

  async getAllStudentsAdmin(query?: string) {
    const qb = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.program', 'program')
      .leftJoinAndSelect('student.targetCareer', 'career')
      .where('student.isAdmin = :isAdmin', { isAdmin: false });

    if (query) {
      qb.andWhere(
        '(student.name LIKE :query OR student.student_number LIKE :query OR student.email LIKE :query)',
        { query: `%${query}%` },
      );
    }

    return qb.getMany();
  }

  async updateStudentAdmin(studentId: number, dto: UpdateStudentAdminDto) {
    const student = await this.studentRepository.findOne({
      where: { student_id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    await this.studentRepository.update(studentId, dto as Partial<Student>);
    return this.studentProfileService.getProfile(studentId);
  }

  async deactivateStudentAdmin(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { student_id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    await this.studentRepository.update(studentId, { isActive: false } as any);
    return { message: 'Student deactivated' };
  }

  async deleteStudentPermanently(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { student_id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    await this.studentRepository.delete(studentId);
    return { message: 'Student permanently deleted' };
  }

  async activateStudentAdmin(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { student_id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    await this.studentRepository.update(studentId, { isActive: true } as any);
    return { message: 'Student activated successfully' };
  }
}
