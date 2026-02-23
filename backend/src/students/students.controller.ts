import { Controller, Post, Body, Headers } from '@nestjs/common';
import { StudentsService } from './students.service';
import { UpdateStudentSubjectsDto } from './dto/update-subjects.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('subjects')
  async saveFinishedSubjects(
    @Body() body: UpdateStudentSubjectsDto,
    @Headers('authorization') authHeader?: string,
  ) {
    const studentId = this.studentsService.getStudentIdFromAuthHeader(authHeader);
    await this.studentsService.setFinishedSubjectsForStudent(studentId, body.subjects);
    return { message: 'Finished subjects updated' };
  }

  @Post('subjects/liked')
  async saveLikedSubjects(
    @Body() body: UpdateStudentSubjectsDto,
    @Headers('authorization') authHeader?: string,
  ) {
    const studentId = this.studentsService.getStudentIdFromAuthHeader(authHeader);
    await this.studentsService.setLikedSubjectsForStudent(studentId, body.subjects);
    return { message: 'Liked subjects updated' };
  }
}

