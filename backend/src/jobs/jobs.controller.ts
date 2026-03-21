import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('program_id') programId?: string,
    @Query('career_id') careerId?: string,
    @Query('work_type') workType?: 'On-site' | 'Hybrid' | 'Remote',
  ) {
    return this.jobsService.list({
      q,
      program_id: programId ? parseInt(programId, 10) : undefined,
      career_id: careerId ? parseInt(careerId, 10) : undefined,
      work_type: workType,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/recommended')
  async recommended(@Request() req: { user: { sub: number } }) {
    return this.jobsService.recommendedForStudent(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/saved')
  async saved(@Request() req: { user: { sub: number } }) {
    return this.jobsService.listSaved(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async toggleSave(@Request() req: { user: { sub: number } }, @Param('id') id: string) {
    return this.jobsService.toggleSave(req.user.sub, parseInt(id, 10));
  }

  // Admin-like endpoints (no admin system yet; keep protected for now)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateJobDto) {
    return this.jobsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateJobDto) {
    return this.jobsService.update(parseInt(id, 10), body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.jobsService.getById(parseInt(id, 10));
  }
}
