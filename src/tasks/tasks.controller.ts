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
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import type { Task } from './interfaces/task.interface';
import { User } from '../users/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@CurrentUser() user: User): Promise<Task[]> {
    return this.tasksService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.findOne(id, user.id);
  }

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, user.id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User): void {
    this.tasksService.remove(id, user.id);
  }
}
