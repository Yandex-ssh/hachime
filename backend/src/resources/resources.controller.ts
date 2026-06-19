import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { DevelopmentResource } from './development-resource.entity';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('type') type?: DevelopmentResource['type'],
    @Query('program_id') programId?: string,
    @Query('difficulty') difficulty?: DevelopmentResource['difficulty'],
    @Query('cost_type') costType?: DevelopmentResource['cost_type'],
  ) {
    return this.resourcesService.list({
      q,
      type,
      program_id: programId ? parseInt(programId, 10) : undefined,
      difficulty,
      cost_type: costType,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/recommended')
  async recommended(@Request() req: { user: { sub: number } }) {
    return this.resourcesService.recommendedForStudent(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/saved')
  async saved(@Request() req: { user: { sub: number } }) {
    return this.resourcesService.listSaved(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async toggleSave(
    @Request() req: { user: { sub: number } },
    @Param('id') id: string,
  ) {
    return this.resourcesService.toggleSave(req.user.sub, parseInt(id, 10));
  }

  // Admin-like endpoints (no admin system yet; keep protected for now)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateResourceDto) {
    return this.resourcesService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateResourceDto) {
    return this.resourcesService.update(parseInt(id, 10), body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.resourcesService.getById(parseInt(id, 10));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.resourcesService.delete(parseInt(id, 10));
  }

  @UseGuards(AdminGuard)
  @Get('admin/student/:studentId/saved')
  async getStudentSavedResources(@Param('studentId') studentId: string) {
    return this.resourcesService.listSaved(parseInt(studentId, 10));
  }

  @UseGuards(AdminGuard)
  @Post('admin/student/:studentId/saves/:id/toggle')
  async adminToggleSaveResource(
    @Param('studentId') studentId: string,
    @Param('id') id: string,
  ) {
    return this.resourcesService.toggleSave(
      parseInt(studentId, 10),
      parseInt(id, 10),
    );
  }
}
