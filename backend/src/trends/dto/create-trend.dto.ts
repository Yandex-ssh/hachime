export class CreateTrendDto {
  title: string;
  icon?: string;
  growth_rate?: string;
  demand_level?: string;
  salary_min?: number;
  salary_max?: number;
  description?: string;
  top_roles?: string[];
  top_skills?: string[];
  top_companies?: string[];
  insight?: string;
  year?: number;
  is_active?: boolean;
}
