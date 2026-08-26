import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { defaultIfEmpty, lastValueFrom } from '@depyronick/nestjs-clickhouse';
import { ClickHouseClient } from '@depyronick/clickhouse-client';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  constructor(
    @Inject('CLICKHOUSE_INSTANCE_TOKEN')
    private readonly chClient: ClickHouseClient,
  ) {}

  async onModuleInit() {
    console.log('📊 AnalyticsService инициализируется...');
    await this.createTableIfNotExists();
  }

  private async createTableIfNotExists() {
    const query = `
    CREATE TABLE IF NOT EXISTS task_events (
      event_time DateTime DEFAULT now(),
      action String,
      task_id String,
      user_id String,
      status String,
      project_id String
    ) ENGINE = MergeTree()
    ORDER BY (event_time)
  `;
    try {
      // defaultIfEmpty(null) — если Observable пустой, вернёт null
      await lastValueFrom(
        this.chClient.query(query).pipe(defaultIfEmpty(null)),
      );
      console.log('✅ Таблица task_events создана или уже существует');
    } catch (err) {
      console.error('❌ Ошибка создания таблицы:', err);
    }
  }

  async logEvent(data: {
    action: string;
    task_id: string;
    user_id: string;
    status?: string;
    project_id?: string;
  }) {
    const { action, task_id, user_id, status = '', project_id = '' } = data;
    const query = `
      INSERT INTO task_events (action, task_id, user_id, status, project_id)
      VALUES ('${action}', '${task_id}', '${user_id}', '${status}', '${project_id}')
    `;
    await this.chClient.query(query);
  }

  async getEventsByUser(userId: string, days = 7) {
    const query = `
    SELECT
      toDate(event_time) AS day,
      COUNT() AS events
    FROM task_events
    WHERE user_id = '${userId}'
      AND event_time >= now() - INTERVAL ${days} DAY
    GROUP BY day
    ORDER BY day
  `;

    // Преобразуем Observable в Promise
    const result$ = this.chClient.query(query);
    const result = await lastValueFrom(result$);

    // Теперь result — это ответ от ClickHouse, у него есть метод .json()
    return result.json();
  }
}
