import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: PinoLogger,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password || ''))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    this.logger.info('Logining user');
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string, name: string): Promise<User> {
    this.logger.info('Registering user');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });
    return this.userRepository.save(user);
  }
}
