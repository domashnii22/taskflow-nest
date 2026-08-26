import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('App (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = app.get(DataSource);
    // Очищаем БД перед тестами
    await dataSource.query('DELETE FROM tasks');
    await dataSource.query('DELETE FROM users');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Auth', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'secret', name: 'Test' })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should login and return a token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'secret' })
        .expect(201);

      expect(response.body.data).toHaveProperty('access_token');
    });
  });

  describe('Tasks', () => {
    let token: string;

    beforeAll(async () => {
      // Логинимся, чтобы получить токен
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'secret' });
      token = loginRes.body.data.access_token;
    });

    it('should create a task', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'E2E task', status: 'todo' })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('E2E task');
    });

    it('should list tasks for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    // Добавьте тесты для обновления, удаления, ошибок 404, валидации и т.д.
  });
});
