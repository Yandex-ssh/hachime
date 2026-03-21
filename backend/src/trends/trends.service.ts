import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndustryTrend } from '../entities/industry-trend.entity';

@Injectable()
export class TrendsService {
  constructor(
    @InjectRepository(IndustryTrend)
    private trendsRepository: Repository<IndustryTrend>,
  ) {}

  async listActive() {
    const rows = await this.trendsRepository.find({
      where: { is_active: true },
      order: { year: 'DESC', created_at: 'DESC' },
    });

    return rows.map((t) => ({
      id: t.trend_id,
      title: t.title,
      icon: t.icon ?? null,
      growth: t.growth_rate ?? null,
      demandLevel: t.demand_level ?? null,
      salaryMin: t.salary_min != null ? Number(t.salary_min) : null,
      salaryMax: t.salary_max != null ? Number(t.salary_max) : null,
      description: t.description ?? null,
      topRoles: t.top_roles ?? [],
      topSkills: t.top_skills ?? [],
      companies: t.top_companies ?? [],
      insight: t.insight ?? null,
      year: t.year ?? null,
    }));
  }

  async snapshot(year?: number) {
    const useYear = year ?? new Date().getFullYear();
    const [{ total = 0 } = {}] = await this.trendsRepository.query(
      'SELECT COUNT(*) as total FROM industry_trends WHERE is_active = true AND (`year` = ? OR `year` IS NULL)',
      [useYear],
    );
    return { year: useYear, active_trends: Number(total) || 0 };
  }
}
