import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // !!! для продакшена выключаем, используем миграции
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true, // автоматически запускать миграции при старте
        logging: true, // видеть SQL-запросы в консоли
      }),
    }),
  ],
})
export class DatabaseModule {}
