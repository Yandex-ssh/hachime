import { Controller, Get, Param } from '@nestjs/common';
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
}
