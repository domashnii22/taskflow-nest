import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Название задачи обязательно' })
  title!: string;

  @IsOptional()
  @IsIn(['todo', 'in-progress', 'done'], {
    message: 'Статус должен быть: todo, in-progress или done',
  })
  status?: 'todo' | 'in-progress' | 'done';
}
