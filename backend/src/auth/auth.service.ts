import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Student } from '../entities/student.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MoreThan } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const student = await this.studentsRepository.findOne({ where: { email } });

    if (!student) {
      // For security, don't reveal if the email exists
      return {
        message:
          'If your email is in our system, you will receive a reset link.',
      };
    }

    // #13 – Use cryptographically secure random 6-digit OTP (1 hour expiry)
    const tokenNum =
      (parseInt(crypto.randomBytes(3).toString('hex'), 16) % 900000) + 100000;
    const token = tokenNum.toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    await this.studentsRepository.update(student.student_id, {
      reset_password_token: token,
      reset_password_expires: expiry,
    });

    await this.mailService.sendPasswordResetEmail(email, token);

    return {
      message: 'If your email is in our system, you will receive a reset link.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, new_password } = resetPasswordDto;

    const student = await this.studentsRepository.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: MoreThan(new Date()),
      },
    });

    if (!student) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update password and clear token
    await this.studentsRepository.update(student.student_id, {
      password_hash,
      reset_password_token: null,
      reset_password_expires: null,
    });

    return { message: 'Password has been reset successfully' };
  }

  async login(loginDto: LoginDto) {
    const { student_number, password } = loginDto;

    // Find student by student_number or email
    const student = await this.studentsRepository.findOne({
      where: [{ student_number: student_number }, { email: student_number }],
      relations: ['program'],
    });

    if (!student) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (student.isActive === false) {
      if (!student.last_login) {
        throw new UnauthorizedException(
          'Your account is pending admin approval.',
        );
      } else {
        throw new UnauthorizedException(
          'Account has been deactivated. Please contact an administrator.',
        );
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      student.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Determine if this is the first login (no previous last_login)
    const isFirstLogin = !student.last_login;

    // Update last login
    await this.studentsRepository.update(student.student_id, {
      last_login: new Date(),
    });

    // Generate JWT token
    const payload = {
      sub: student.student_id,
      student_number: student.student_number,
      isAdmin: student.isAdmin,
    };

    return {
      access_token: this.jwtService.sign(payload),
      is_first_login: isFirstLogin,
      student: {
        student_id: student.student_id,
        name: student.name,
        student_number: student.student_number,
        program: student.program?.program_name,
        program_id: student.program_id,
        year_level: student.year_level,
        email: student.email,
        profile_picture_url: student.profile_picture_url,
        isAdmin: student.isAdmin,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if student_number already exists
    const existing = await this.studentsRepository.findOne({
      where: { student_number: registerDto.student_number },
    });

    if (existing) {
      throw new ConflictException('Student number already registered');
    }

    // Hash password
    const password_hash = await bcrypt.hash(registerDto.password, 10);

    // Create student
    const student = this.studentsRepository.create({
      ...registerDto,
      password_hash,
      isActive: false,
    });

    await this.studentsRepository.save(student);

    return {
      message: 'Registration successful',
      student_number: student.student_number,
    };
  }

  // #2 – Admin password reset: use random unique password, never return it in response
  async adminResetStudentPassword(
    studentId: number,
  ): Promise<{ message: string }> {
    const student = await this.studentsRepository.findOne({
      where: { student_id: studentId },
    });
    if (!student) throw new UnauthorizedException('Student not found');

    // Generate a secure random temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex'); // 16-char hex string
    const password_hash = await bcrypt.hash(tempPassword, 10);

    await this.studentsRepository.update(studentId, { password_hash });

    // If student has an email, send the new password to them
    if (student.email) {
      await this.mailService.sendPasswordResetEmail(
        student.email,
        tempPassword,
      );
    }

    return {
      message: student.email
        ? 'Password has been reset and emailed to the student.'
        : 'Password has been reset. The student has no email on file — please inform them manually.',
    };
  }
}
