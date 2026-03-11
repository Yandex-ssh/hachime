import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Student } from '../entities/student.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { student_number, password } = loginDto;
    
    // Find student with program info
    const student = await this.studentsRepository.findOne({
      where: { student_number },
      relations: ['program'],
    });

    if (!student) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password_hash);
    
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
      student_number: student.student_number 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      is_first_login: isFirstLogin,
      student: {
        student_id: student.student_id,
        name: student.name,
        student_number: student.student_number,
        program: student.program?.program_name,
        year_level: student.year_level,
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
    });

    await this.studentsRepository.save(student);

    return { 
      message: 'Registration successful',
      student_number: student.student_number,
    };
  }
}
