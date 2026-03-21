import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from '../entities/career.entity';

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(Career)
    private careersRepository: Repository<Career>,
  ) {}

  async getCareerMatches(studentId: number) {
    // Get student's finished subjects
    const finishedSubjects = await this.careersRepository.query(
      `SELECT subject_id FROM student_subjects 
       WHERE student_id = ? AND is_finished = true`,
      [studentId],
    );

    // Get student's liked subjects
    const likedSubjects = await this.careersRepository.query(
      `SELECT subject_id FROM student_subjects 
       WHERE student_id = ? AND is_liked = true`,
      [studentId],
    );

    const finishedIds = finishedSubjects.map((s) => s.subject_id);
    const likedIds = likedSubjects.map((s) => s.subject_id);

    // Get all careers with their required subjects
    const careers = await this.careersRepository.query(`
      SELECT 
        c.career_id,
        c.title,
        c.icon,
        c.description,
        c.salary_min,
        c.salary_max,
        c.growth_rate,
        c.demand_level,
        c.job_examples
      FROM careers c
    `);

    // Calculate match for each career
    const careerMatches = await Promise.all(
      careers.map(async (career) => {
        // Get required subjects for this career
        const requiredSubjects = await this.careersRepository.query(
          `SELECT subject_id, weight, is_required 
           FROM career_subjects 
           WHERE career_id = ?`,
          [career.career_id],
        );

        const totalRequired = requiredSubjects.filter(
          (s) => s.is_required,
        ).length;

        if (totalRequired === 0) {
          return { ...career, match: 0 };
        }

        // Count how many required subjects the student finished
        const matchedRequired = requiredSubjects.filter(
          (rs) => rs.is_required && finishedIds.includes(rs.subject_id),
        ).length;

        // Base match percentage
        let matchPercentage = (matchedRequired / totalRequired) * 100;

        // Bonus points for liked subjects (up to +15%)
        const likedAndRequired = requiredSubjects.filter((rs) =>
          likedIds.includes(rs.subject_id),
        ).length;

        const likedBonus = Math.min(likedAndRequired * 5, 15);
        matchPercentage = Math.min(matchPercentage + likedBonus, 100);

        return {
          ...career,
          match: Math.round(matchPercentage),
        };
      }),
    );

    // Sort by match percentage (highest first)
    return careerMatches
      .filter((c) => c.match > 0)
      .sort((a, b) => b.match - a.match);
  }

  async getAllCareers() {
    return this.careersRepository.find();
  }

  async getCareerById(careerId: number) {
    return this.careersRepository.findOne({
      where: { career_id: careerId },
    });
  }
}
