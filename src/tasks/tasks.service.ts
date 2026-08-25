import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async findAll(userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { userId },
      relations: { user: true },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
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
    const newTask = this.taskRepository.create({
      ...createTaskDto,
      userId,
    });
    return this.taskRepository.save(newTask);
  }

  async update(
    id: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.taskRepository.delete({ id: id, userId: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }
}
