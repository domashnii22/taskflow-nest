import { Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from './interfaces/task.interface';

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    { id: '1', title: 'Изучить NestJS', status: 'todo' },
    { id: '2', title: 'Написать пет-проект', status: 'in-progress' },
  ];

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  create(
    title: string,
    status: 'todo' | 'in-progress' | 'done' = 'todo',
  ): Task {
    const newTask: Task = {
      id: String(Date.now()),
      title,
      status,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  update(id: string, updateData: Partial<Omit<Task, 'id'>>): Task {
    const task = this.findOne(id); // переиспользуем метод с проверкой существования
    Object.assign(task, updateData);
    return task;
  }

  remove(id: string): void {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    this.tasks.splice(index, 1);
  }
}
