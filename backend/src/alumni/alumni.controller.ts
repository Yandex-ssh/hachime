import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('alumni')
export class AlumniController {
  constructor(private alumniService: AlumniService) {}

  @Get()
  async list(@Query('program') program?: string, @Query('admin') admin?: string) {
    const isAdmin = admin === 'true';
    return this.alumniService.list(program, isAdmin);
  }

  @Get('stats')
  async stats() {
    return this.alumniService.stats();
  }

  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() dto: CreateAlumniDto) {
    return this.alumniService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAlumniDto) {
    return this.alumniService.update(+id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.alumniService.delete(+id);
  }
}
