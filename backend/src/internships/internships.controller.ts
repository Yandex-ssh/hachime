import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
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

  // --- Admin Routes ---

  @UseGuards(AdminGuard)
  @Get('admin/all')
  async listAdmin() {
    console.log('Fetching all internships for admin');
    return this.internshipsService.listAdmin();
  }

  @UseGuards(AdminGuard)
  @Post('admin')
  async createInternship(@Body() body: any) {
    return this.internshipsService.createInternship(body);
  }

  @UseGuards(AdminGuard)
  @Patch('admin/:id')
  async updateInternship(@Param('id') id: string, @Body() body: any) {
    return this.internshipsService.updateInternship(parseInt(id, 10), body);
  }

  @UseGuards(AdminGuard)
  @Delete('admin/:id')
  async deleteInternship(@Param('id') id: string) {
    return this.internshipsService.deleteInternship(parseInt(id, 10));
  }

  @UseGuards(AdminGuard)
  @Get('admin/:id/saves')
  async getInternshipSaves(@Param('id') id: string) {
    return this.internshipsService.getInternshipSaves(parseInt(id, 10));
  }

  @UseGuards(AdminGuard)
  @Get('admin/student/:studentId/saved')
  async getStudentSavedInternships(@Param('studentId') studentId: string) {
    return this.internshipsService.listSaved(parseInt(studentId, 10));
  }

  @UseGuards(AdminGuard)
  @Post('admin/student/:studentId/saves/:id/toggle')
  async adminToggleSaveInternship(
    @Param('studentId') studentId: string,
    @Param('id') id: string,
  ) {
    return this.internshipsService.toggleSave(
      parseInt(studentId, 10),
      parseInt(id, 10),
    );
  }

  // --- Student Routes ---

  @UseGuards(JwtAuthGuard)
  @Get('me/saved')
  async saved(@Request() req: { user: { sub: number } }) {
    await this.assertFourthYear(req.user.sub);
    return this.internshipsService.listSaved(req.user.sub);
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
  async get(
    @Request() req: { user: { sub: number } },
    @Param('id') id: string,
  ) {
    await this.assertFourthYear(req.user.sub);
    return this.internshipsService.getById(parseInt(id, 10));
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
