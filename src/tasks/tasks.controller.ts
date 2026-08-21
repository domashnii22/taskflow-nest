import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

@Controller('tasks') // все маршруты в этом контроллере будут начинаться с /tasks
export class TasksController {
  // Временный in-memory массив
  private tasks = [
    { id: '1', title: 'Изучить NestJS', status: 'todo' },
    { id: '2', title: 'Написать пет-проект', status: 'in-progress' },
  ];

  @Get()
  findAll() {
    return this.tasks;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error('Task not found'); // позже заменим на нормальную обработку
    }
    return task;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 Created
  create(@Body() body: { title: string; status?: string }) {
    const newTask = {
      id: String(Date.now()),
      title: body.title,
      status: body.status || 'todo',
    };
    this.tasks.push(newTask);
    return newTask;
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; status?: string },
  ) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }
    if (body.title) task.title = body.title;
    if (body.status) task.status = body.status;
    return task;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  remove(@Param('id') id: string) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    this.tasks.splice(index, 1);
  }
}
