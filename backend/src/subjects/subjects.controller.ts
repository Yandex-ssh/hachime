import { Controller, Get, Query } from '@nestjs/common';
import { SubjectsService } from './subjects.service';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  async list(
    @Query('program_id') programId?: string,
    @Query('max_year_level') maxYearLevel?: string,
  ) {
    const pid = programId ? parseInt(programId, 10) : undefined;
    const myl = maxYearLevel ? parseInt(maxYearLevel, 10) : undefined;
    return this.subjectsService.list({
      program_id: Number.isFinite(pid as number) ? (pid as number) : undefined,
      max_year_level: Number.isFinite(myl as number) ? (myl as number) : undefined,
    });
  }
}

