import { IsArray, IsInt } from 'class-validator';

export class SaveSubjectsDto {
  @IsArray()
  @IsInt({ each: true })
  finished_subject_ids: number[];

  @IsArray()
  @IsInt({ each: true })
  liked_subject_ids: number[];
}
