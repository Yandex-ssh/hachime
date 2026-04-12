import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternshipsController } from './internships.controller';
import { InternshipsService } from './internships.service';
import { Internship } from '../entities/internship.entity';
import { AuthModule } from '../auth/auth.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [TypeOrmModule.forFeature([Internship]), AuthModule, StudentsModule],
  controllers: [InternshipsController],
  providers: [InternshipsService],
})
export class InternshipsModule {}
