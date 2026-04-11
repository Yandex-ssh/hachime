import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Whitelisted fields an admin can update on a student.
 * Does NOT include isAdmin or password_hash for safety.
 */
export class UpdateStudentAdminDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  year_level?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  semester?: number;

  @IsOptional()
  @IsInt()
  program_id?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
