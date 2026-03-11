import { Controller, Post, Get, Body, Request, UseGuards, Patch } from '@nestjs/common';
import { StudentsService } from './students.service';
import { SaveSubjectsDto } from './dto/save-subjects.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('subjects')
  async saveSubjects(@Request() req, @Body() body: SaveSubjectsDto) {
    return this.studentsService.saveSubjects(req.user.sub, body);
  }

  @Get('profile/:id')
  async getProfile(@Request() req) {
    const studentId = parseInt(req.params.id);
    return this.studentsService.getProfile(studentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.studentsService.getMeProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Request() req, @Body() body: UpdateProfileDto) {
    return this.studentsService.updateProfile(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(@Request() req, @Body() body: ChangePasswordDto) {
    return this.studentsService.changePassword(req.user.sub, body);
  }
}