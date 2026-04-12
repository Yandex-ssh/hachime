import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../entities/subject.entity';
import { Skill } from '../entities/skill.entity';
import { SubjectSkill } from '../entities/subject-skill.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(SubjectSkill)
    private readonly subjectSkillsRepository: Repository<SubjectSkill>,
  ) {}

  async list(filters?: { program_id?: number; max_year_level?: number }) {
    const where: string[] = [];
    const params: any[] = [];

    if (filters?.program_id != null) {
      where.push('s.program_id = ?');
      params.push(filters.program_id);
    }
    if (filters?.max_year_level != null) {
      where.push('(s.year_level IS NULL OR s.year_level <= ?)');
      params.push(filters.max_year_level);
    }

    const sql = `
      SELECT s.subject_id, s.subject_code, s.subject_name, s.program_id, s.year_level, s.semester, s.category
      FROM subjects s
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY s.year_level ASC, s.semester ASC, s.subject_name ASC
      LIMIT 2000
    `;

    return this.subjectsRepository.query(sql, params);
  }

  async createSubject(data: Partial<Subject>) {
    const subject = this.subjectsRepository.create(data);
    return this.subjectsRepository.save(subject);
  }

  async updateSubject(id: number, data: Partial<Subject>) {
    const subject = await this.subjectsRepository.findOne({
      where: { subject_id: id },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    await this.subjectsRepository.update(id, data);
    return this.subjectsRepository.findOne({ where: { subject_id: id } });
  }

  async deleteSubject(id: number) {
    const subject = await this.subjectsRepository.findOne({
      where: { subject_id: id },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    await this.subjectsRepository.delete(id);
    return { message: 'Subject deleted successfully' };
  }

  async bulkImport(fileBuffer: Buffer) {
    const content = fileBuffer.toString('utf-8');
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length < 2) return { message: 'No data found' };

    // Header row
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const expectedHeaders = [
      'subject_code',
      'subject_name',
      'program_id',
      'year_level',
      'semester',
      'category',
    ];

    const importedSubjects: Subject[] = [];
    for (let i = 1; i < lines.length; i++) {
      // Very basic CSV split
      const values = lines[i].split(',').map((v) => v.trim());
      const subjectData: any = {};

      headers.forEach((header, index) => {
        if (expectedHeaders.includes(header)) {
          const val = values[index];
          if (['program_id', 'year_level', 'semester'].includes(header)) {
            subjectData[header] = val ? parseInt(val) : null;
          } else {
            subjectData[header] = val;
          }
        }
      });

      if (subjectData.subject_name) {
        const subject = this.subjectsRepository.create(
          subjectData,
        ) as unknown as Subject;
        importedSubjects.push(subject);
      }
    }

    if (importedSubjects.length > 0) {
      await this.subjectsRepository.insert(importedSubjects);
    }

    return {
      message: `Successfully imported ${importedSubjects.length} subjects`,
    };
  }

  async getSubjectSkills(subjectId: number) {
    return this.subjectSkillsRepository.find({
      where: { subject_id: subjectId },
      relations: ['skill'],
      order: { weight: 'DESC' },
    });
  }

  async getSubjectSkillsAll() {
    return this.subjectSkillsRepository.find({
      relations: ['skill'],
      order: { subject_id: 'ASC', weight: 'DESC' },
    });
  }

  async linkSkill(subjectId: number, skillId: number, weight: number) {
    const subject = await this.subjectsRepository.findOne({
      where: { subject_id: subjectId },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    const skill = await this.skillsRepository.findOne({
      where: { skill_id: skillId },
    });
    if (!skill) throw new NotFoundException('Skill not found');

    let link = await this.subjectSkillsRepository.findOne({
      where: { subject_id: subjectId, skill_id: skillId },
    });
    if (link) {
      link.weight = weight;
    } else {
      link = this.subjectSkillsRepository.create({
        subject_id: subjectId,
        skill_id: skillId,
        weight,
      });
    }
    return this.subjectSkillsRepository.save(link);
  }

  async unlinkSkill(subjectId: number, skillId: number) {
    await this.subjectSkillsRepository.delete({
      subject_id: subjectId,
      skill_id: skillId,
    });
    return { message: 'Skill unlinked successfully' };
  }
}
