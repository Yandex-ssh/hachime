import { Injectable } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { SaveSubjectsDto } from './dto/save-subjects.dto';
import { SaveSubjectsByNameDto } from './dto/save-subjects-by-name.dto';

@Injectable()
export class StudentSubjectsService {
  constructor(private readonly studentRepository: StudentRepository) {}

  async saveSubjectsByName(studentId: number, dto: SaveSubjectsByNameDto) {
    const { finished_subject_names, liked_subject_names } = dto;
    const allNames = [
      ...new Set([
        ...(finished_subject_names ?? []),
        ...(liked_subject_names ?? []),
      ]),
    ];
    if (allNames.length === 0) {
      await this.studentRepository.deleteStudentSubjects(studentId);
      return { message: 'Subjects saved successfully' };
    }

    const rows = await this.studentRepository.findSubjectsByNames(allNames);
    const nameToId = new Map<string, number>(
      rows.map((r) => [r.subject_name, r.subject_id]),
    );

    const finishedIds: number[] = [];
    const likedIds: number[] = [];
    for (const name of finished_subject_names ?? []) {
      const id = nameToId.get(name);
      if (id != null) finishedIds.push(id);
    }
    for (const name of liked_subject_names ?? []) {
      const id = nameToId.get(name);
      if (id != null) likedIds.push(id);
    }

    return this.saveSubjects(studentId, {
      finished_subject_ids: finishedIds,
      liked_subject_ids: likedIds,
    });
  }

  async saveSubjects(studentId: number, saveSubjectsDto: SaveSubjectsDto) {
    const { finished_subject_ids, liked_subject_ids } = saveSubjectsDto;

    await this.studentRepository.deleteStudentSubjects(studentId);

    const set = new Set<number>([
      ...(finished_subject_ids ?? []),
      ...(liked_subject_ids ?? []),
    ]);

    if (set.size === 0) {
      return { message: 'Subjects saved successfully' };
    }

    await this.studentRepository.bulkInsertStudentSubjects(
      studentId,
      finished_subject_ids ?? [],
      liked_subject_ids ?? [],
      set,
    );

    return { message: 'Subjects saved successfully' };
  }

  async getMySubjects(studentId: number) {
    const finished = await this.studentRepository.getFinishedSubjectsList(studentId);
    const liked = await this.studentRepository.getLikedSubjectsList(studentId);

    return {
      finished_subjects: finished,
      liked_subjects: liked,
    };
  }
}
