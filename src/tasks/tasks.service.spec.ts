import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { getLoggerToken } from 'nestjs-pino';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  const mockTask: Task = {
    id: '1',
    title: 'Test task',
    status: 'todo',
    userId: 'user1',
    user: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    verbose: jest.fn(),
    setContext: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getLoggerToken(TasksService.name), // поставляем мок
          useValue: mockLogger,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return tasks for a user', async () => {
      const tasks = [mockTask];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.findAll('user1');
      expect(result).toEqual(tasks);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        relations: { user: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a task if it belongs to the user', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('1', 'user1');
      expect(result).toEqual(mockTask);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
        relations: { user: true },
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Аналогично для create, update, remove...
});
