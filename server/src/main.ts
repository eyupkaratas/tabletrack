import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // dto’da olmayan alanları siliyor
      forbidNonWhitelisted: true, // dto dışı alan gelirse hata fırlatıyor
      transform: true, // payload’u otomatik DTO’ya çeviriyor
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost:3000', // Local
      'http://client:3000', // Docker
      'https://tabletrack-rho.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    credentials: true,
  });
  await app.listen(3001);
}
bootstrap();
