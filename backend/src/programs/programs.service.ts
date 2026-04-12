import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../entities/program.entity';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
  ) {}

  async list() {
    const rows = await this.programsRepository.find({
      order: { program_code: 'ASC' },
    });
    return rows.map((p) => ({
      program_id: p.program_id,
      program_code: p.program_code,
      program_name: p.program_name,
      description: p.description ?? null,
      total_years: p.total_years,
    }));
  }
}
