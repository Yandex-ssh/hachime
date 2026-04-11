import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Alumni } from '../entities/alumni.entity';
import { Subject } from '../entities/subject.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Alumni) private alumniRepo: Repository<Alumni>,
    @InjectRepository(Subject) private subjectsRepo: Repository<Subject>,
  ) {}

  async exportStudents(): Promise<string> {
    const students = await this.studentsRepo.find({
      where: { isAdmin: false },
      relations: ['program'],
    });

    const header = 'Student ID,Name,Email,Program,Year Level,Semester,Last Login,Status\n';
    const rows = students.map(s => {
      return `"${s.student_number}","${s.name}","${s.email || ''}","${s.program?.program_code || ''}",${s.year_level || ''},${s.semester || ''},"${s.last_login?.toISOString() || ''}","${s.isActive ? 'Active' : 'Inactive'}"`;
    });

    return header + rows.join('\n');
  }

  async exportAlumni(): Promise<string> {
    const alumni = await this.alumniRepo.find({ relations: ['program'] });
    const header = 'Name,Batch,Program,Position,Company,LinkedIn,Visibility\n';
    const rows = alumni.map(a => {
      return `"${a.name}","${a.batch_year}","${a.program?.program_code || ''}","${a.current_job_title || ''}","${a.current_company || ''}","${a.linkedin_url || ''}","${a.is_visible ? 'Visible' : 'Hidden'}"`;
    });

    return header + rows.join('\n');
  }

  async exportSubjects(): Promise<string> {
    const subjects = await this.subjectsRepo.find({ relations: ['program'] });
    const header = 'Code,Name,Program,Year Level,Semester,Category\n';
    const rows = subjects.map(s => {
      return `"${s.subject_code}","${s.subject_name}","${s.program?.program_code || ''}",${s.year_level || ''},${s.semester || ''},"${s.category || ''}"`;
    });

    return header + rows.join('\n');
  }
}
