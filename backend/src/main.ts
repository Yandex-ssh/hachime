import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // <--- Add this line!
  await app.listen(4000); // Change to 4000 so it doesn't fight with Next.js
  console.log('Backend is running on: http://localhost:4000');
}
bootstrap();