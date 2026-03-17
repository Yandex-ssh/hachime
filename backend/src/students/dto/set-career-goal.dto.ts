import { IsInt, IsOptional } from 'class-validator';

export class SetCareerGoalDto {
  @IsOptional()
  @IsInt()
  target_career_id?: number | null;
}
