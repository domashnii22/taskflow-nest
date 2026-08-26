import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TrimPipe } from './common/pipes/trim.pipe';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useGlobalInterceptors(
    new MetricsInterceptor(),
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
  );

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
