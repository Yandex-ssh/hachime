import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryTrend } from './industry-trend.entity';
import { TrendsController } from './trends.controller';
import { TrendsService } from './trends.service';

@Module({
  imports: [TypeOrmModule.forFeature([IndustryTrend])],
  controllers: [TrendsController],
  providers: [TrendsService],
})
export class TrendsModule {}
