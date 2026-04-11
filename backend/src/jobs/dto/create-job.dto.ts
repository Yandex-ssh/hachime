import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MaxLength(255)
  company_name: string;

  @IsString()
  @MaxLength(255)
  role_title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsEnum(['On-site', 'Hybrid', 'Remote'] as const)
  work_type?: 'On-site' | 'Hybrid' | 'Remote';

  @IsOptional()
  @IsEnum(['Full-time', 'Part-time', 'Contract'] as const)
  employment_type?: 'Full-time' | 'Part-time' | 'Contract';

  @IsOptional()
  @IsEnum(['Entry-level', 'Junior', 'Mid', 'Senior'] as const)
  experience_level?: 'Entry-level' | 'Junior' | 'Mid' | 'Senior';

  @IsOptional()
  @IsInt()
  program_id?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  program_ids?: number[];

  @IsOptional()
  @IsInt()
  career_id?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  requirements?: unknown;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  required_subject_ids?: number[];

  @IsOptional()
  @IsUrl({ require_tld: false })
  apply_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  deadline?: string; // YYYY-MM-DD
}
