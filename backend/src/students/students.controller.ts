import { Controller, Post, Get, Body, Request, UseGuards, Patch } from '@nestjs/common';
import { StudentsService } from './students.service';
import { SaveSubjectsDto } from './dto/save-subjects.dto';
import { SaveSubjectsByNameDto } from './dto/save-subjects-by-name.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetCareerGoalDto } from './dto/set-career-goal.dto';

@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('subjects')
  async saveSubjects(@Request() req, @Body() body: SaveSubjectsDto) {
    return this.studentsService.saveSubjects(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subjects/by-names')
  async saveSubjectsByName(@Request() req, @Body() body: SaveSubjectsByNameDto) {
    return this.studentsService.saveSubjectsByName(req.user.sub, body);
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

  @UseGuards(JwtAuthGuard)
  @Patch('me/career-goal')
  async setCareerGoal(@Request() req, @Body() body: SetCareerGoalDto) {
    return this.studentsService.setCareerGoal(req.user.sub, body);
  }
}