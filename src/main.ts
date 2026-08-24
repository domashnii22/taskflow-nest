import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Глобальный пайп для валидации всех входящих запросов
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет свойства, которых нет в DTO
      forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние свойства
      transform: true, // автоматически преобразует входящие данные в экземпляры DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
