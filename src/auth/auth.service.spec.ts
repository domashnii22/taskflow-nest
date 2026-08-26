import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { getLoggerToken } from 'nestjs-pino';

describe('AuthService', () => {
  let service: AuthService;

  jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
  }));

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashed',
    name: 'Test User',
    tasks: [],
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
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getLoggerToken(AuthService.name),
          useValue: mockLogger,
        },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.validateUser(
        'wrong@example.com',
        'password',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const result = await service.login(mockUser);
      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });
});
