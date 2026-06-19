import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { CareersModule } from './careers/careers.module';
import { AlumniModule } from './alumni/alumni.module';
import { TrendsModule } from './trends/trends.module';
import { JobsModule } from './jobs/jobs.module';
import { ResourcesModule } from './resources/resources.module';
import { InternshipsModule } from './internships/internships.module';
import { ProgramsModule } from './programs/programs.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SkillsModule } from './skills/skills.module';
import { ReportsModule } from './reports/reports.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: parseInt(configService.get('REDIS_PORT') || '6379', 10),
          },
        }),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    StudentsModule,
    CareersModule,
    ProgramsModule,
    SubjectsModule,
    AlumniModule,
    TrendsModule,
    JobsModule,
    ResourcesModule,
    InternshipsModule,
    AnalyticsModule,
    SkillsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
