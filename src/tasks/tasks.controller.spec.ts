import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from '../users/user.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockUser: User = {
    id: 'user1',
    email: 'test@example.com',
    name: 'Test',
    password: 'hash',
    tasks: [],
  };
  const mockTask = { id: '1', title: 'Task', status: 'todo', userId: 'user1' };

  const mockTasksService = {
    findAll: jest.fn().mockResolvedValue([mockTask]),
    findOne: jest.fn().mockResolvedValue(mockTask),
    create: jest.fn().mockResolvedValue(mockTask),
    update: jest.fn().mockResolvedValue({ ...mockTask, title: 'Updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return tasks for user', async () => {
      const result = await controller.findAll(mockUser);
      expect(result).toEqual([mockTask]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      const dto: CreateTaskDto = { title: 'New task', status: 'todo' };
      const result = await controller.create(dto, mockUser);
      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(dto, mockUser.id);
    });
  });

  // аналогично для update и remove
});
