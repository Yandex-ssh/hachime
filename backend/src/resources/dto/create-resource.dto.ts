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

export class CreateResourceDto {
  @IsEnum([
    'Course',
    'Certification',
    'Roadmap',
    'Article',
    'Bootcamp',
  ] as const)
  type: 'Course' | 'Certification' | 'Roadmap' | 'Article' | 'Bootcamp';

  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  provider?: string;

  @IsUrl({ require_tld: false })
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  program_id?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  skill_ids?: number[];

  @IsOptional()
  @IsEnum(['Beginner', 'Intermediate', 'Advanced'] as const)
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';

  @IsOptional()
  @IsEnum(['Free', 'Paid', 'Freemium'] as const)
  cost_type?: 'Free' | 'Paid' | 'Freemium';

  @IsOptional()
  @IsBoolean()
  certificate_offered?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
