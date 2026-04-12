import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateTrendDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  growth_rate?: string;

  @IsOptional()
  @IsString()
  demand_level?: string;

  @IsOptional()
  @IsNumber()
  salary_min?: number;

  @IsOptional()
  @IsNumber()
  salary_max?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  top_roles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  top_skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  top_companies?: string[];

  @IsOptional()
  @IsString()
  insight?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  program_ids?: number[];
}
