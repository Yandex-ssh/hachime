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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { SaveSubjectsDto } from './dto/save-subjects.dto';
import { SaveSubjectsByNameDto } from './dto/save-subjects-by-name.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetCareerGoalDto } from './dto/set-career-goal.dto';
import { UpdateStudentAdminDto } from './dto/update-student-admin.dto';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(
    private studentsService: StudentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('subjects')
  @ApiOperation({ summary: 'Save finished and liked subjects by IDs' })
  @ApiResponse({ status: 200, description: 'Subjects successfully saved.' })
  async saveSubjects(@Request() req, @Body() body: SaveSubjectsDto) {
    return this.studentsService.saveSubjects(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('subjects/by-names')
  @ApiOperation({ summary: 'Save finished and liked subjects by name strings' })
  @ApiResponse({ status: 200, description: 'Subjects successfully saved.' })
  async saveSubjectsByName(
    @Request() req,
    @Body() body: SaveSubjectsByNameDto,
  ) {
    return this.studentsService.saveSubjectsByName(req.user.sub, body);
  }

  // #3 – Protected: only admins can view arbitrary student profiles
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('profile/:id')
  @ApiOperation({ summary: 'Get arbitrary student profile (Admin only)' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return student profile.' })
  async getProfile(@Param('id') id: string) {
    const studentId = parseInt(id);
    return this.studentsService.getProfile(studentId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('me')
  @ApiOperation({ summary: 'Get logged in student profile info' })
  @ApiResponse({ status: 200, description: 'Return student dashboard profile data.' })
  async getMe(@Request() req) {
    return this.studentsService.getMeProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('me/skills')
  @ApiOperation({ summary: 'Get logged in student skills breakdown' })
  @ApiResponse({ status: 200, description: 'Return skill plans and progress (Cached).' })
  async getMySkills(@Request() req) {
    return this.studentsService.getMySkills(req.user.sub);
  }

  // TEMP DEV ENDPOINT
  @Get('test-skills/:id')
  @ApiOperation({ summary: 'Test endpoint to query skills by ID (No auth)' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async testSkills(@Param('id') id: string) {
    return this.studentsService.getMySkills(parseInt(id, 10));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('me/pathway')
  @ApiOperation({ summary: 'Get logged in student career roadmap pathway' })
  @ApiResponse({ status: 200, description: 'Return career roadmap, growth rates, and salary details (Cached).' })
  async getMyPathway(@Request() req) {
    return this.studentsService.getMyPathway(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('me/subjects')
  @ApiOperation({ summary: 'Get logged in student finished/liked subjects list' })
  async getMySubjects(@Request() req) {
    return this.studentsService.getMySubjects(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('me')
  @ApiOperation({ summary: 'Update profile details for logged in student' })
  async updateMe(@Request() req, @Body() body: UpdateProfileDto) {
    return this.studentsService.updateProfile(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('me/password')
  @ApiOperation({ summary: 'Change password for logged in student' })
  async changePassword(@Request() req, @Body() body: ChangePasswordDto) {
    return this.studentsService.changePassword(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('me/career-goal')
  @ApiOperation({ summary: 'Set or update career goal ID' })
  async setCareerGoal(@Request() req, @Body() body: SetCareerGoalDto) {
    return this.studentsService.setCareerGoal(req.user.sub, body);
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Get()
  @ApiOperation({ summary: 'List all non-admin students with optional search (Admin only)' })
  @ApiQuery({ name: 'search', required: false, description: 'Filter by name, student number, or email' })
  async getAllStudents(@Query('search') search?: string) {
    return this.studentsService.getAllStudentsAdmin(search);
  }

  // #8 – Typed DTO prevents privilege escalation
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch(':id/admin')
  @ApiOperation({ summary: 'Admin modification of student record' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async updateStudentAdmin(
    @Param('id') id: string,
    @Body() body: UpdateStudentAdminDto,
  ) {
    return this.studentsService.updateStudentAdmin(parseInt(id), body);
  }

  // #10 – Route kept as-is for API compatibility; service method renamed to deactivate
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch(':id/admin/deactivate')
  @ApiOperation({ summary: 'Deactivate student account (Admin only)' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async deactivateStudentAdmin(@Param('id') id: string) {
    return this.studentsService.deactivateStudentAdmin(parseInt(id));
  }

  // Keep old DELETE route as alias for backwards compat (soft deactivate only)
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete(':id/admin')
  @ApiOperation({ summary: 'Alias delete endpoint to soft deactivate student (Admin only)' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async deleteStudentAdminAlias(@Param('id') id: string) {
    return this.studentsService.deactivateStudentAdmin(parseInt(id));
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Post(':id/admin/activate')
  @ApiOperation({ summary: 'Activate student account (Admin only)' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async activateStudentAdmin(@Param('id') id: string) {
    return this.studentsService.activateStudentAdmin(parseInt(id));
  }

  // #2 – Admin reset password now delegates to AuthService (no plaintext returned)
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset student password and send new password (Admin only)' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async adminResetPassword(@Param('id') id: string) {
    return this.studentsService.adminResetStudentPassword(parseInt(id));
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete(':id/admin/permanent')
  @ApiOperation({ summary: 'Permanently delete student from database (Admin only)' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async deleteStudentPermanently(@Param('id') id: string) {
    return this.studentsService.deleteStudentPermanently(parseInt(id));
  }

  // --- Admin Proxy Methods ---
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Post(':studentId/admin/subjects')
  @ApiOperation({ summary: 'Admin updates a specific student\'s subjects' })
  @ApiParam({ name: 'studentId', description: 'Target Student ID' })
  async adminSaveSubjects(
    @Param('studentId') studentId: string,
    @Body() body: SaveSubjectsDto,
  ) {
    return this.studentsService.saveSubjects(parseInt(studentId, 10), body);
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch(':studentId/admin/career-goal')
  @ApiOperation({ summary: 'Admin updates a specific student\'s career goal' })
  @ApiParam({ name: 'studentId', description: 'Target Student ID' })
  async adminSetCareerGoal(
    @Param('studentId') studentId: string,
    @Body() body: SetCareerGoalDto,
  ) {
    return this.studentsService.setCareerGoal(parseInt(studentId, 10), body);
  }
}

