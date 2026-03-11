import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = {
  sub: number;
  student_number: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

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
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

