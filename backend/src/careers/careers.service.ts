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
        c.job_examples,
        c.program_id
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
          (rs) => rs.is_required && finishedIds.includes(Number(rs.subject_id)),
        ).length;

        // Base match percentage
        let matchPercentage = (matchedRequired / totalRequired) * 100;

        // Bonus points for liked subjects (up to +15%)
        const likedAndRequired = requiredSubjects.filter((rs) =>
          likedIds.includes(Number(rs.subject_id)),
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

  async createCareer(data: Partial<Career>) {
    const career = this.careersRepository.create(data);
    return this.careersRepository.save(career);
  }

  async updateCareer(id: number, data: Partial<Career>) {
    await this.careersRepository.update(id, data);
    return this.getCareerById(id);
  }

  async deleteCareer(id: number) {
    await this.careersRepository.delete(id);
    return { message: 'Career deleted' };
  }

  async getCareerSubjectsAdmin(careerId: number) {
    return this.careersRepository.query(`
      SELECT cs.subject_id, s.subject_code, s.subject_name, cs.weight, cs.is_required
      FROM career_subjects cs
      JOIN subjects s ON s.subject_id = cs.subject_id
      WHERE cs.career_id = ?
    `, [careerId]);
  }

  async linkSubjectToCareer(careerId: number, subjectId: number, weight: number, is_required: boolean) {
    await this.careersRepository.query(
      'DELETE FROM career_subjects WHERE career_id = ? AND subject_id = ?',
      [careerId, subjectId],
    );
    await this.careersRepository.query(
      'INSERT INTO career_subjects (career_id, subject_id, weight, is_required) VALUES (?, ?, ?, ?)',
      [careerId, subjectId, weight, is_required],
    );
    return { message: 'Subject linked' };
  }

  async unlinkSubjectFromCareer(careerId: number, subjectId: number) {
    await this.careersRepository.query(
      'DELETE FROM career_subjects WHERE career_id = ? AND subject_id = ?',
      [careerId, subjectId],
    );
    return { message: 'Subject unlinked' };
  }

  async getCareerSkillsAdmin(careerId: number) {
    return this.careersRepository.query(`
      SELECT cs.skill_id, s.skill_name, s.category, s.expanded_skills, cs.priority
      FROM career_skills cs
      JOIN skills s ON s.skill_id = cs.skill_id
      WHERE cs.career_id = ?
    `, [careerId]);
  }

  async linkSkillToCareer(careerId: number, skillId: number, priority: 'low' | 'medium' | 'high') {
    await this.careersRepository.query(
      'DELETE FROM career_skills WHERE career_id = ? AND skill_id = ?',
      [careerId, skillId],
    );
    await this.careersRepository.query(
      'INSERT INTO career_skills (career_id, skill_id, priority) VALUES (?, ?, ?)',
      [careerId, skillId, priority],
    );
    return { message: 'Skill linked' };
  }

  async unlinkSkillFromCareer(careerId: number, skillId: number) {
    await this.careersRepository.query(
      'DELETE FROM career_skills WHERE career_id = ? AND skill_id = ?',
      [careerId, skillId],
    );
    return { message: 'Skill unlinked' };
  }
}
