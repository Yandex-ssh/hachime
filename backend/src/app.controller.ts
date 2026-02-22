import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('status')
  checkStatus() {
    return { status: 'NestJS is alive!', timestamp: new Date().toISOString() };
  }
}