import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Student } from '../entities/student.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

import { MailModule } from '../mail/mail.module';

import { AdminGuard } from './admin.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, AdminGuard],
  exports: [TypeOrmModule, JwtModule, JwtAuthGuard, AdminGuard, AuthService],
})
export class AuthModule {}
