import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JobListing } from '../entities/job-listing.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobListing]), AuthModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
