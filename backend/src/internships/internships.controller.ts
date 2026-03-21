import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InternshipsService } from './internships.service';
import { StudentsService } from '../students/students.service';

@Controller('internships')
export class InternshipsController {
  constructor(
    private readonly internshipsService: InternshipsService,
    private readonly studentsService: StudentsService,
  ) {}

  private async assertFourthYear(studentId: number) {
    const me = await this.studentsService.getMeProfile(studentId);
    if ((me.year_level ?? null) !== 4) {
      throw new ForbiddenException(
        'Internships are only available for 4th year students.',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(
    @Request() req: { user: { sub: number } },
    @Query('q') q?: string,
    @Query('work_type') workType?: 'On-site' | 'Hybrid' | 'Remote',
  ) {
    await this.assertFourthYear(req.user.sub);
    return this.internshipsService.list({ q, work_type: workType });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Request() req: { user: { sub: number } }, @Param('id') id: string) {
    await this.assertFourthYear(req.user.sub);
    return this.internshipsService.getById(parseInt(id, 10));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/saved')
  async saved(@Request() req: { user: { sub: number } }) {
    await this.assertFourthYear(req.user.sub);
    return this.internshipsService.listSaved(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async toggleSave(
    @Request() req: { user: { sub: number } },
    @Param('id') id: string,
  ) {
    await this.assertFourthYear(req.user.sub);
    return this.internshipsService.toggleSave(req.user.sub, parseInt(id, 10));
  }
}

