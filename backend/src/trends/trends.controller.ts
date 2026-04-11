import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTrendDto } from './dto/create-trend.dto';
import { UpdateTrendDto } from './dto/update-trend.dto';
import { TrendsService } from './trends.service';

@Controller('trends')
export class TrendsController {
  constructor(private trendsService: TrendsService) {}

  @Get()
  async list() {
    return this.trendsService.listActive();
  }

  @Get('snapshot')
  async snapshot(@Query('year') year?: string) {
    const parsed = year ? parseInt(year, 10) : undefined;
    return this.trendsService.snapshot(
      Number.isFinite(parsed as number) ? parsed : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateTrendDto) {
    return this.trendsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateTrendDto) {
    return this.trendsService.update(parseInt(id, 10), body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.trendsService.delete(parseInt(id, 10));
  }
}
