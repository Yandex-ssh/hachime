import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { CareersService } from './careers.service';

@Controller('careers')
export class CareersController {
  constructor(private careersService: CareersService) {}

  @Get()
  async getAllCareers() {
    return this.careersService.getAllCareers();
  }

  @Get('matches/:studentId')
  async getCareerMatches(@Param('studentId') studentId: string) {
    return this.careersService.getCareerMatches(parseInt(studentId));
  }

  @Get(':id')
  async getCareerById(@Param('id') id: string) {
    return this.careersService.getCareerById(parseInt(id));
  }

  @UseGuards(AdminGuard)
  @Post()
  async createCareer(@Body() body: any) {
    return this.careersService.createCareer(body);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async updateCareer(@Param('id') id: string, @Body() body: any) {
    return this.careersService.updateCareer(parseInt(id), body);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteCareer(@Param('id') id: string) {
    return this.careersService.deleteCareer(parseInt(id));
  }

  @UseGuards(AdminGuard)
  @Get(':id/subjects')
  async getCareerSubjectsAdmin(@Param('id') id: string) {
    return this.careersService.getCareerSubjectsAdmin(parseInt(id));
  }

  @UseGuards(AdminGuard)
  @Post(':id/subjects/:subjectId')
  async linkSubjectToCareer(
    @Param('id') id: string,
    @Param('subjectId') subjectId: string,
    @Body() body: { weight: number; is_required: boolean },
  ) {
    return this.careersService.linkSubjectToCareer(
      parseInt(id),
      parseInt(subjectId),
      body.weight || 1,
      body.is_required !== false,
    );
  }

  @UseGuards(AdminGuard)
  @Delete(':id/subjects/:subjectId')
  async unlinkSubjectFromCareer(
    @Param('id') id: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.careersService.unlinkSubjectFromCareer(
      parseInt(id),
      parseInt(subjectId),
    );
  }

  @UseGuards(AdminGuard)
  @Get(':id/skills')
  async getCareerSkillsAdmin(@Param('id') id: string) {
    return this.careersService.getCareerSkillsAdmin(parseInt(id));
  }

  @UseGuards(AdminGuard)
  @Post(':id/skills/:skillId')
  async linkSkillToCareer(
    @Param('id') id: string,
    @Param('skillId') skillId: string,
    @Body() body: { priority: 'low' | 'medium' | 'high' },
  ) {
    return this.careersService.linkSkillToCareer(
      parseInt(id),
      parseInt(skillId),
      body.priority || 'medium',
    );
  }

  @UseGuards(AdminGuard)
  @Delete(':id/skills/:skillId')
  async unlinkSkillFromCareer(
    @Param('id') id: string,
    @Param('skillId') skillId: string,
  ) {
    return this.careersService.unlinkSkillFromCareer(
      parseInt(id),
      parseInt(skillId),
    );
  }
}
