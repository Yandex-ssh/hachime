import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../entities/subject.entity';
import { Skill } from '../entities/skill.entity';
import { SubjectSkill } from '../entities/subject-skill.entity';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Skill, SubjectSkill])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}

