import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl, server-to-server, etc.)
      if (!origin) return callback(null, true);

      const allowedExact = new Set(['http://localhost:3000', 'http://127.0.0.1:3000']);
      if (allowedExact.has(origin)) return callback(null, true);

      // Allow common LAN dev origins like http://192.168.x.x:3000
      if (/^http:\/\/(192\.168|10|172\.(1[6-9]|2\d|3[0-1]))(\.\d{1,3}){2}:3000$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`), false);
    },
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
