import { Module, Global } from '@nestjs/common';
import { ClickHouseClient } from '@depyronick/clickhouse-client';
import { AnalyticsService } from './analytics.service';

@Global()
@Module({
  providers: [
    {
      provide: 'CLICKHOUSE_INSTANCE_TOKEN',
      useFactory: () => {
        return new ClickHouseClient({
          host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
          username: process.env.CLICKHOUSE_USER || 'default',
          password: process.env.CLICKHOUSE_PASSWORD || '',
          database: process.env.CLICKHOUSE_DB || 'default',
        });
      },
    },
    AnalyticsService,
  ],
  exports: ['CLICKHOUSE_INSTANCE_TOKEN', AnalyticsService],
})
export class AnalyticsModule {}
