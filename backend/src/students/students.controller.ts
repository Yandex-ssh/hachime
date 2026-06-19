import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Patch,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { SaveSubjectsDto } from './dto/save-subjects.dto';
import { SaveSubjectsByNameDto } from './dto/save-subjects-by-name.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetCareerGoalDto } from './dto/set-career-goal.dto';
import { UpdateStudentAdminDto } from './dto/update-student-admin.dto';

@Controller('students')
export class StudentsController {
  constructor(
    private studentsService: StudentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('subjects')
  async saveSubjects(@Request() req, @Body() body: SaveSubjectsDto) {
    return this.studentsService.saveSubjects(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subjects/by-names')
  async saveSubjectsByName(
    @Request() req,
    @Body() body: SaveSubjectsByNameDto,
  ) {
    return this.studentsService.saveSubjectsByName(req.user.sub, body);
  }

  // #3 – Protected: only admins can view arbitrary student profiles
  @UseGuards(AdminGuard)
  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    const studentId = parseInt(id);
    return this.studentsService.getProfile(studentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.studentsService.getMeProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/skills')
  async getMySkills(@Request() req) {
    return this.studentsService.getMySkills(req.user.sub);
  }

  // TEMP DEV ENDPOINT
  @Get('test-skills/:id')
  async testSkills(@Param('id') id: string) {
    return this.studentsService.getMySkills(parseInt(id, 10));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/pathway')
  async getMyPathway(@Request() req) {
    return this.studentsService.getMyPathway(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/subjects')
  async getMySubjects(@Request() req) {
    return this.studentsService.getMySubjects(req.user.sub);
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

  @UseGuards(AdminGuard)
  @Get()
  async getAllStudents(@Query('search') search?: string) {
    return this.studentsService.getAllStudentsAdmin(search);
  }

  // #8 – Typed DTO prevents privilege escalation
  @UseGuards(AdminGuard)
  @Patch(':id/admin')
  async updateStudentAdmin(
    @Param('id') id: string,
    @Body() body: UpdateStudentAdminDto,
  ) {
    return this.studentsService.updateStudentAdmin(parseInt(id), body);
  }

  // #10 – Route kept as-is for API compatibility; service method renamed to deactivate
  @UseGuards(AdminGuard)
  @Patch(':id/admin/deactivate')
  async deactivateStudentAdmin(@Param('id') id: string) {
    return this.studentsService.deactivateStudentAdmin(parseInt(id));
  }

  // Keep old DELETE route as alias for backwards compat (soft deactivate only)
  @UseGuards(AdminGuard)
  @Delete(':id/admin')
  async deleteStudentAdminAlias(@Param('id') id: string) {
    return this.studentsService.deactivateStudentAdmin(parseInt(id));
  }

  @UseGuards(AdminGuard)
  @Post(':id/admin/activate')
  async activateStudentAdmin(@Param('id') id: string) {
    return this.studentsService.activateStudentAdmin(parseInt(id));
  }

  // #2 – Admin reset password now delegates to AuthService (no plaintext returned)
  @UseGuards(AdminGuard)
  @Post(':id/reset-password')
  async adminResetPassword(@Param('id') id: string) {
    return this.studentsService.adminResetStudentPassword(parseInt(id));
  }

  @UseGuards(AdminGuard)
  @Delete(':id/admin/permanent')
  async deleteStudentPermanently(@Param('id') id: string) {
    return this.studentsService.deleteStudentPermanently(parseInt(id));
  }

  // --- Admin Proxy Methods ---
  @UseGuards(AdminGuard)
  @Post(':studentId/admin/subjects')
  async adminSaveSubjects(
    @Param('studentId') studentId: string,
    @Body() body: SaveSubjectsDto,
  ) {
    return this.studentsService.saveSubjects(parseInt(studentId, 10), body);
  }

  @UseGuards(AdminGuard)
  @Patch(':studentId/admin/career-goal')
  async adminSetCareerGoal(
    @Param('studentId') studentId: string,
    @Body() body: SetCareerGoalDto,
  ) {
    return this.studentsService.setCareerGoal(parseInt(studentId, 10), body);
  }
}
