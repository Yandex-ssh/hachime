import { Injectable } from '@nestjs/common';
import { StudentProfileService } from './student-profile.service';
import { StudentSubjectsService } from './student-subjects.service';
import { StudentSkillsService } from './student-skills.service';
import { StudentAdminService } from './student-admin.service';
import { AuthService } from '../auth/auth.service';
import { SaveSubjectsDto } from './dto/save-subjects.dto';
import { SaveSubjectsByNameDto } from './dto/save-subjects-by-name.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetCareerGoalDto } from './dto/set-career-goal.dto';
import { UpdateStudentAdminDto } from './dto/update-student-admin.dto';

@Injectable()
export class StudentsService {
  constructor(
    private readonly profileService: StudentProfileService,
    private readonly subjectsService: StudentSubjectsService,
    private readonly skillsService: StudentSkillsService,
    private readonly adminService: StudentAdminService,
    private readonly authService: AuthService,
  ) {}

  async saveSubjectsByName(studentId: number, dto: SaveSubjectsByNameDto) {
    const result = await this.subjectsService.saveSubjectsByName(studentId, dto);
    await this.skillsService.invalidateStudentCache(studentId);
    return result;
  }

  async saveSubjects(studentId: number, saveSubjectsDto: SaveSubjectsDto) {
    const result = await this.subjectsService.saveSubjects(studentId, saveSubjectsDto);
    await this.skillsService.invalidateStudentCache(studentId);
    return result;
  }

  async getProfile(studentId: number) {
    return this.profileService.getProfile(studentId);
  }

  async getMeProfile(studentId: number) {
    return this.profileService.getMeProfile(studentId);
  }

  async getMySkills(studentId: number) {
    return this.skillsService.getMySkills(studentId);
  }

  async getMyPathway(studentId: number) {
    return this.skillsService.getMyPathway(studentId);
  }

  async setCareerGoal(studentId: number, dto: SetCareerGoalDto) {
    const result = await this.profileService.setCareerGoal(studentId, dto);
    await this.skillsService.invalidateStudentCache(studentId);
    return result;
  }

  async updateProfile(studentId: number, dto: UpdateProfileDto) {
    const result = await this.profileService.updateProfile(studentId, dto);
    await this.skillsService.invalidateStudentCache(studentId);
    return result;
  }

  async getMySubjects(studentId: number) {
    return this.subjectsService.getMySubjects(studentId);
  }

  async changePassword(studentId: number, dto: ChangePasswordDto) {
    return this.profileService.changePassword(studentId, dto);
  }

  async getAllStudentsAdmin(query?: string) {
    return this.adminService.getAllStudentsAdmin(query);
  }

  async updateStudentAdmin(studentId: number, dto: UpdateStudentAdminDto) {
    return this.adminService.updateStudentAdmin(studentId, dto);
  }

  async deactivateStudentAdmin(studentId: number) {
    return this.adminService.deactivateStudentAdmin(studentId);
  }

  async deleteStudentPermanently(studentId: number) {
    return this.adminService.deleteStudentPermanently(studentId);
  }

  async activateStudentAdmin(studentId: number) {
    return this.adminService.activateStudentAdmin(studentId);
  }

  async adminResetStudentPassword(studentId: number) {
    return this.authService.adminResetStudentPassword(studentId);
  }
}
