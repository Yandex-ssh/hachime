import { IsNotEmpty, IsString, IsInt, Min, Max, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  student_number: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  program_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  year_level?: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  email?: string;
}