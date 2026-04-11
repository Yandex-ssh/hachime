import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumni } from '../entities/alumni.entity';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';

@Injectable()
export class AlumniService {
  constructor(
    @InjectRepository(Alumni)
    private alumniRepository: Repository<Alumni>,
  ) {}

  async list(programCode?: string, isAdmin = false) {
    const qb = this.alumniRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.program', 'p');

    if (!isAdmin) {
      qb.where('a.is_visible = true');
    }

    if (programCode && programCode !== 'All') {
      qb.andWhere('p.program_code = :programCode', { programCode });
    }

    const rows = await qb.orderBy('a.created_at', 'DESC').getMany();
    return rows.map((a) => ({
      id: a.alumni_id,
      name: a.name,
      program: a.program?.program_code ?? null,
      batch: a.batch_year ? String(a.batch_year) : null,
      graduatedYear: a.graduated_year ?? a.batch_year ?? null,
      currentRole: a.current_job_title ?? null,
      company: a.current_company ?? null,
      location: a.location ?? null,
      salary: a.salary_range ?? null,
      monthsToLand: a.months_to_land_job ?? null,
      favoriteSubjects: a.favorite_subjects ?? [],
      skills: a.skills_used ?? [],
      internships: a.internships ?? [],
      advice: a.advice ?? null,
      linkedin: a.linkedin_url ?? null,
    }));
  }

  async stats() {
    const [{ total = 0 } = {}] = await this.alumniRepository.query(
      'SELECT COUNT(*) as total FROM alumni WHERE is_visible = true',
    );

    // Average salary is tricky because salary_range is text; expose a safe aggregate:
    // - avg_months_to_land_job from numeric column
    const [{ avgMonths = null } = {}] = await this.alumniRepository.query(
      'SELECT AVG(months_to_land_job) as avgMonths FROM alumni WHERE is_visible = true AND months_to_land_job IS NOT NULL',
    );

    const [{ hiredIn6 = 0 } = {}] = await this.alumniRepository.query(
      'SELECT COUNT(*) as hiredIn6 FROM alumni WHERE is_visible = true AND months_to_land_job IS NOT NULL AND months_to_land_job <= 6',
    );

    const [{ companies = 0 } = {}] = await this.alumniRepository.query(
      'SELECT COUNT(DISTINCT current_company) as companies FROM alumni WHERE is_visible = true AND current_company IS NOT NULL AND current_company <> ""',
    );

    const totalNum = Number(total) || 0;
    const hiredIn6Num = Number(hiredIn6) || 0;
    const hiredIn6Pct =
      totalNum > 0 ? Math.round((hiredIn6Num / totalNum) * 100) : 0;

    return {
      total_alumni: totalNum,
      avg_months_to_land_job:
        avgMonths != null ? Math.round(Number(avgMonths)) : null,
      hired_in_6_months_percent: hiredIn6Pct,
      companies: Number(companies) || 0,
    };
  }

  async create(dto: CreateAlumniDto) {
    const alumni = this.alumniRepository.create(dto);
    return this.alumniRepository.save(alumni);
  }

  async update(id: number, dto: UpdateAlumniDto) {
    await this.alumniRepository.update(id, dto);
    return this.alumniRepository.findOne({ where: { alumni_id: id } });
  }

  async delete(id: number) {
    return this.alumniRepository.delete(id);
  }
}
