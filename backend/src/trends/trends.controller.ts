import { Controller, Get, Query } from '@nestjs/common';
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
}
