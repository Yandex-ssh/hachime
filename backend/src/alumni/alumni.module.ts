import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alumni } from '../entities/alumni.entity';
import { Program } from '../entities/program.entity';
import { AlumniController } from './alumni.controller';
import { AlumniService } from './alumni.service';

@Module({
  imports: [TypeOrmModule.forFeature([Alumni, Program])],
  controllers: [AlumniController],
  providers: [AlumniService],
})
export class AlumniModule {}
