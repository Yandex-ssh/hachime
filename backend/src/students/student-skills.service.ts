import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { StudentRepository } from './student.repository';
import { StudentProfileService } from './student-profile.service';

@Injectable()
export class StudentSkillsService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly studentProfileService: StudentProfileService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private mapPercentToLevel(
    percent: number,
  ): 'None' | 'Beginner' | 'Intermediate' | 'Advanced' {
    if (percent >= 80) return 'Advanced';
    if (percent >= 50) return 'Intermediate';
    if (percent >= 20) return 'Beginner';
    return 'None';
  }

  async invalidateStudentCache(studentId: number): Promise<void> {
    await this.cacheManager.del(`student_skills_${studentId}`);
    await this.cacheManager.del(`student_pathway_${studentId}`);
  }

  async getMySkills(studentId: number) {
    const cacheKey = `student_skills_${studentId}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const me = await this.studentProfileService.getMeProfile(studentId);
    const careerGoal = me.career_goal ?? null;

    if (!careerGoal) {
      const result = {
        target_career: null,
        derived_level: 'None',
        categories: [],
        message: 'Set a career goal to get a personalized skill plan.',
      };
      await this.cacheManager.set(cacheKey, result, 600000); // cache for 10 minutes (ms or seconds depending on cache-manager v5+, in v5+ it is ms)
      return result;
    }

    const rows = await this.studentRepository.getSkillsForCareer(careerGoal.career_id);
    const derivedLevel = this.mapPercentToLevel(careerGoal.progress.percent);
    
    const subjectSkillProgressRows = await this.studentRepository.getSubjectSkillProgress(
      studentId,
      careerGoal.career_id,
    );
    
    const perSkillLevel = new Map<
      number,
      'None' | 'Beginner' | 'Intermediate' | 'Advanced'
    >();
    const dynamicPriorityMap = new Map<number, 'high' | 'medium' | 'low'>();

    for (const r of subjectSkillProgressRows) {
      const total = Number(r.total_weight) || 0;
      if (total <= 0) continue;
      const earned = Number(r.earned_weight) || 0;
      const pct = Math.round((earned / total) * 100);

      perSkillLevel.set(Number(r.skill_id), this.mapPercentToLevel(pct));
      dynamicPriorityMap.set(Number(r.skill_id), pct < 100 ? 'high' : 'low');
    }

    const categoriesMap = new Map<
      string,
      {
        id: string;
        label: string;
        icon: string;
        skills: Array<{
          name: string;
          level: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
          priority: 'low' | 'medium' | 'high' | null;
          resource: string | null;
          expanded_skills?: any;
        }>;
      }
    >();

    const iconForCategory = (cat: string) => {
      const c = cat.toLowerCase();
      if (c.includes('program')) return '💻';
      if (c.includes('web')) return '🌐';
      if (c.includes('data')) return '📊';
      if (c.includes('tool') || c.includes('soft')) return '🛠️';
      return '⚡';
    };

    for (const r of rows) {
      const label = r.category || 'Other';
      const id = label.toLowerCase().replace(/\s+/g, '-');
      const existing = categoriesMap.get(id);
      const bucket =
        existing ??
        (() => {
          const created = {
            id,
            label,
            icon: iconForCategory(label),
            skills: [],
          };
          categoriesMap.set(id, created);
          return created;
        })();

      bucket.skills.push({
        name: r.skill_name,
        level: perSkillLevel.get(Number(r.skill_id)) ?? derivedLevel,
        priority: dynamicPriorityMap.get(Number(r.skill_id)) ?? 'medium',
        resource: r.learning_resource_url ?? null,
        expanded_skills:
          typeof r.expanded_skills === 'string'
            ? JSON.parse(r.expanded_skills)
            : r.expanded_skills,
      });
    }

    const priorityWeight: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };
    for (const bucket of categoriesMap.values()) {
      bucket.skills.sort((a, b) => {
        const pA = priorityWeight[a.priority as string] ?? 0;
        const pB = priorityWeight[b.priority as string] ?? 0;
        if (pA !== pB) return pB - pA;
        return a.name.localeCompare(b.name);
      });
    }

    const result = {
      target_career: careerGoal,
      derived_level: derivedLevel,
      categories: Array.from(categoriesMap.values()),
      gap: careerGoal.gap ?? { missing_subjects: [] },
    };
    await this.cacheManager.set(cacheKey, result, 600000); // cache for 10 minutes
    return result;
  }

  async getMyPathway(studentId: number) {
    const cacheKey = `student_pathway_${studentId}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const me = await this.studentProfileService.getMeProfile(studentId);
    const careerGoal = me.career_goal ?? null;

    if (!careerGoal) {
      const result = {
        target_career: null,
        roadmap: [],
        message: 'Set a career goal to get a personalized roadmap.',
      };
      await this.cacheManager.set(cacheKey, result, 600000);
      return result;
    }

    const career = await this.studentRepository.getCareerById(careerGoal.career_id);
    const skills = await this.studentRepository.getSkillNamesForCareer(careerGoal.career_id);
    const requiredSubjects = await this.studentRepository.getRequiredSubjectsForRoadmap(careerGoal.career_id);
    const finished = await this.studentRepository.getFinishedSubjectIds(studentId);
    const finishedSet = new Set(finished.map((r) => r.subject_id));

    const byYear = new Map<number, any[]>();
    for (const s of requiredSubjects) {
      const y = Number(s.year_level) || 0;
      const list = byYear.get(y) ?? [];
      list.push({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        semester: s.semester ?? null,
        completed: finishedSet.has(s.subject_id),
      });
      byYear.set(y, list);
    }

    const roadmap = Array.from(byYear.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year_level, subjects]) => {
        const completed = subjects.filter((x) => x.completed).length;
        const total = subjects.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          year_level,
          progress: { completed, total, percent },
          subjects,
        };
      });

    const c = career[0] ?? null;
    const salaryRange =
      c && c.salary_min != null && c.salary_max != null
        ? { min: Number(c.salary_min), max: Number(c.salary_max) }
        : null;

    const salaryByExperience =
      salaryRange != null
        ? {
            entry: {
              min: Math.round(salaryRange.min * 0.8),
              max: Math.round(salaryRange.max * 0.7),
            },
            mid: {
              min: Math.round(salaryRange.min * 1.0),
              max: Math.round(salaryRange.max * 0.9),
            },
            senior: {
              min: Math.round(salaryRange.min * 1.2),
              max: Math.round(salaryRange.max * 1.1),
            },
          }
        : null;

    const result = {
      target_career: {
        career_id: c?.career_id ?? careerGoal.career_id,
        title: c?.title ?? careerGoal.title,
        icon: c?.icon ?? careerGoal.icon ?? null,
        description: c?.description ?? null,
        growth_rate: c?.growth_rate ?? null,
        demand_level: c?.demand_level ?? null,
        job_examples: c?.job_examples ?? [],
        salary_range: salaryRange,
        salary_by_experience: salaryByExperience,
        skills: skills.map((s) => s.skill_name),
      },
      roadmap,
      gap: careerGoal.gap ?? { missing_subjects: [] },
    };
    await this.cacheManager.set(cacheKey, result, 600000);
    return result;
  }
}
