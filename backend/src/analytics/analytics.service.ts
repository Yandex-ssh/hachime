import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Subject } from '../entities/subject.entity';
import { Career } from '../entities/career.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Subject) private subjectsRepo: Repository<Subject>,
    @InjectRepository(Career) private careersRepo: Repository<Career>,
  ) {}

  async getDashboardStats() {
    const totalStudents = await this.studentsRepo.count({ where: { isAdmin: false } });
    const activeProfiles = await this.studentsRepo.count({ where: { isAdmin: false, isActive: true } });
    const totalSubjects = await this.subjectsRepo.count();
    const totalCareers = await this.careersRepo.count();

    // Advanced Metrics
    const popularCareers = await this.getPopularCareers();
    const topSubjects = await this.getMostLikedSubjects();
    const progression = await this.getProgressionStats();

    return { 
      totalStudents, 
      activeProfiles, 
      totalSubjects, 
      totalCareers,
      popularCareers,
      topSubjects,
      progression
    };
  }

  private async getPopularCareers() {
    return this.careersRepo
      .createQueryBuilder('career')
      .leftJoin('students', 'student', 'student.target_career_id = career.career_id')
      .select('career.title', 'title')
      .addSelect('COUNT(student.student_id)', 'count')
      .groupBy('career.career_id')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
  }

  private async getMostLikedSubjects() {
    return this.subjectsRepo
      .createQueryBuilder('subject')
      .innerJoin('student_subjects', 'ss', 'ss.subject_id = subject.subject_id')
      .where('ss.is_liked = :isLiked', { isLiked: true })
      .select('subject.subject_name', 'name')
      .addSelect('COUNT(ss.student_id)', 'count')
      .groupBy('subject.subject_id')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
  }

  private async getProgressionStats() {
    // Average subjects finished per year level
    return this.studentsRepo
      .createQueryBuilder('student')
      .where('student.isAdmin = :isAdmin', { isAdmin: false })
      .select('student.year_level', 'year')
      .addSelect('COUNT(student.student_id)', 'studentCount')
      .groupBy('student.year_level')
      .getRawMany();
  }
}
