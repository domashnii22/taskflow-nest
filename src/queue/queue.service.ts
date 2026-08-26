import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcomeEmail(userEmail: string, userName: string) {
    await this.emailQueue.add(
      'welcome',
      { email: userEmail, name: userName },
      { attempts: 3, backoff: 5000 },
    );
    console.log(
      `📬 Задача отправки письма для ${userEmail} добавлена в очередь`,
    );
  }
}
