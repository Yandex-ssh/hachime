import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined =
      req?.headers?.authorization ?? req?.headers?.Authorization;

    if (!header || typeof header !== 'string') {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      const student = await this.studentsRepository.findOne({
        where: { student_id: payload.sub },
      });

      if (!student || student.isActive === false) {
        throw new UnauthorizedException('Account has been deactivated');
      }

      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
