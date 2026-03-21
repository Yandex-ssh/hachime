import { Controller, Get, Query } from '@nestjs/common';
import { AlumniService } from './alumni.service';

@Controller('alumni')
export class AlumniController {
  constructor(private alumniService: AlumniService) {}

  @Get()
  async list(@Query('program') program?: string) {
    return this.alumniService.list(program);
  }

  @Get('stats')
  async stats() {
    return this.alumniService.stats();
  }
}
