import { IsArray, IsString } from 'class-validator';

export class SaveSubjectsByNameDto {
  @IsArray()
  @IsString({ each: true })
  finished_subject_names: string[];

  @IsArray()
  @IsString({ each: true })
  liked_subject_names: string[];
}
