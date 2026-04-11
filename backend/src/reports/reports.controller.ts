import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AdminGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('students')
  async getStudentsReport(@Res() res: Response) {
    const csv = await this.reportsService.exportStudents();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students_report.csv');
    return res.send(csv);
  }

  @Get('alumni')
  async getAlumniReport(@Res() res: Response) {
    const csv = await this.reportsService.exportAlumni();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=alumni_report.csv');
    return res.send(csv);
  }

  @Get('subjects')
  async getSubjectsReport(@Res() res: Response) {
    const csv = await this.reportsService.exportSubjects();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subjects_report.csv');
    return res.send(csv);
  }
}
