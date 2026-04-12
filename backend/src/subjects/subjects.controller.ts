import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubjectsService } from './subjects.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  async list(
    @Query('program_id') programId?: string,
    @Query('max_year_level') maxYearLevel?: string,
    @Query('search') search?: string,
  ) {
    const pid = programId ? parseInt(programId, 10) : undefined;
    const myl = maxYearLevel ? parseInt(maxYearLevel, 10) : undefined;
    return this.subjectsService.list({
      program_id: Number.isFinite(pid as number) ? (pid as number) : undefined,
      max_year_level: Number.isFinite(myl as number)
        ? (myl as number)
        : undefined,
    }); // TODO: incorporate search into service if needed
  }

  @UseGuards(AdminGuard)
  @Post()
  async createSubject(@Body() body: any) {
    return this.subjectsService.createSubject(body);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async updateSubject(@Param('id') id: string, @Body() body: any) {
    return this.subjectsService.updateSubject(parseInt(id, 10), body);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteSubject(@Param('id') id: string) {
    return this.subjectsService.deleteSubject(parseInt(id, 10));
  }

  @UseGuards(AdminGuard)
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importSubjects(@UploadedFile() file: any) {
    if (!file) return { message: 'No file uploaded' };
    return this.subjectsService.bulkImport(file.buffer);
  }

  @Get('all-skills')
  async listAllSkills() {
    return this.subjectsService.getSubjectSkillsAll();
  }

  @Get(':id/skills')
  async getSubjectSkills(@Param('id') id: string) {
    return this.subjectsService.getSubjectSkills(parseInt(id, 10));
  }

  @UseGuards(AdminGuard)
  @Post(':id/skills/:skillId')
  async linkSkill(
    @Param('id') id: string,
    @Param('skillId') skillId: string,
    @Body('weight') weight: number,
  ) {
    return this.subjectsService.linkSkill(
      parseInt(id, 10),
      parseInt(skillId, 10),
      weight || 5,
    );
  }

  @UseGuards(AdminGuard)
  @Delete(':id/skills/:skillId')
  async unlinkSkill(
    @Param('id') id: string,
    @Param('skillId') skillId: string,
  ) {
    return this.subjectsService.unlinkSkill(
      parseInt(id, 10),
      parseInt(skillId, 10),
    );
  }
}
