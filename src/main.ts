import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { TrimPipe } from './common/pipes/trim.pipe';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { HttpExceptionFilter } from './common/interceptors/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // app.useGlobalGuards(new ApiKeyGuard());

  // Глобальный пайп для валидации всех входящих запросов
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true, // удаляет свойства, которых нет в DTO
      forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние свойства
      transform: true, // автоматически преобразует входящие данные в экземпляры DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
