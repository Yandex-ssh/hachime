import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Student } from '../entities/student.entity';
import { Alumni } from '../entities/alumni.entity';
import { Subject } from '../entities/subject.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Alumni, Subject]), AuthModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
