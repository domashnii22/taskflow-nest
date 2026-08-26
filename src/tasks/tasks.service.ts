import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueueService } from '../queue/queue.service';
import { User } from '../users/user.entity';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectPinoLogger(TasksService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private queueService: QueueService,
    private analyticsService: AnalyticsService,
  ) {
    this.logger.setContext(TasksService.name);
  }

  async findAll(userId: string): Promise<Task[]> {
    this.logger.info({ userId }, 'Fetching all tasks for user');

    return this.taskRepository.find({
      where: { userId },
      relations: { user: true },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    this.logger.info({ userId }, 'Finding task for user');
    const task = await this.taskRepository.findOne({
      where: { id, userId },
      relations: { user: true },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    this.logger.info({ userId }, 'Creating task for user');
    const newTask = this.taskRepository.create({
      ...createTaskDto,
      userId,
    });
    await this.taskRepository.save(newTask);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user?.email) {
      await this.queueService.sendWelcomeEmail(user.email, user.name);
    }

    await this.analyticsService.logEvent({
      action: 'create',
      task_id: newTask.id,
      user_id: userId,
      status: newTask.status,
    });

    return newTask;
  }

  async update(
    id: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    this.logger.info({ userId }, 'Updating task for user');
    const task = await this.findOne(id, userId);

    Object.assign(task, updateTaskDto);

    if (updateTaskDto.status) {
      await this.analyticsService.logEvent({
        action: 'status_change',
        task_id: id,
        user_id: userId,
        status: updateTaskDto.status,
      });
    }

    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.info({ userId }, 'Removing task for user');
    const result = await this.taskRepository.delete({ id: id, userId: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }
}
