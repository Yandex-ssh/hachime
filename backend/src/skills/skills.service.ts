import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async list() {
    return this.skillsRepository.find({
      order: { skill_name: 'ASC' },
    });
  }

  async createSkill(data: Partial<Skill>) {
    const skill = this.skillsRepository.create(data);
    return this.skillsRepository.save(skill);
  }

  async updateSkill(id: number, data: Partial<Skill>) {
    const skill = await this.skillsRepository.findOne({
      where: { skill_id: id },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.skillsRepository.update(id, data);
    return this.skillsRepository.findOne({ where: { skill_id: id } });
  }

  async deleteSkill(id: number) {
    const skill = await this.skillsRepository.findOne({
      where: { skill_id: id },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.skillsRepository.delete(id);
    return { message: 'Skill deleted successfully' };
  }
}
