import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from './student.entity';
import { Career } from '../careers/career.entity';
import { AuthModule } from '../auth/auth.module';
import { StudentRepository } from './student.repository';
import { StudentProfileService } from './student-profile.service';
import { StudentSubjectsService } from './student-subjects.service';
import { StudentSkillsService } from './student-skills.service';
import { StudentAdminService } from './student-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Career]), AuthModule],
  controllers: [StudentsController],
  providers: [
    StudentRepository,
    StudentProfileService,
    StudentSubjectsService,
    StudentSkillsService,
    StudentAdminService,
    StudentsService,
  ],
  exports: [StudentsService],
})
export class StudentsModule {}
