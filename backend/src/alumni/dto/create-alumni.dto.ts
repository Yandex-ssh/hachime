import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class CreateAlumniDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  program_id?: number;

  @IsOptional()
  @IsInt()
  batch_year?: number;

  @IsOptional()
  @IsInt()
  graduated_year?: number;

  @IsOptional()
  @IsString()
  current_job_title?: string;

  @IsOptional()
  @IsString()
  current_company?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  salary_range?: string;

  @IsOptional()
  @IsInt()
  months_to_land_job?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favorite_subjects?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills_used?: string[];

  @IsOptional()
  @IsArray()
  internships?: Array<{
    role_title?: string;
    company_name?: string;
    location?: string;
    year?: number;
  }>;

  @IsOptional()
  @IsString()
  advice?: string;

  @IsOptional()
  @IsUrl()
  linkedin_url?: string;

  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;
}
