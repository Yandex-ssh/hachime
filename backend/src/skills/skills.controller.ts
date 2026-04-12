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
import { SkillsService } from './skills.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async list() {
    return this.skillsService.list();
  }

  @UseGuards(AdminGuard)
  @Post()
  async createSkill(@Body() body: any) {
    return this.skillsService.createSkill(body);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async updateSkill(@Param('id') id: string, @Body() body: any) {
    return this.skillsService.updateSkill(parseInt(id, 10), body);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteSkill(@Param('id') id: string) {
    return this.skillsService.deleteSkill(parseInt(id, 10));
  }
}
