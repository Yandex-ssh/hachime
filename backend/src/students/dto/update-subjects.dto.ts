import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class UpdateStudentSubjectsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  subjects: string[];
}

