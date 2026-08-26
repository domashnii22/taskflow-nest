import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';
import { QueueModule } from '../queue/queue.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User]), UsersModule, QueueModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
