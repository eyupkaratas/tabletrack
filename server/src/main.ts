import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // dto’da olmayan alanları siliyor
      forbidNonWhitelisted: true, // dto dışı alan gelirse hata fırlatıyor
      transform: true, // payload’u otomatik DTO’ya çeviriyor
    }),
  );
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(3001);
}
bootstrap();
