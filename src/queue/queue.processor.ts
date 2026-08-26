import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('email')
export class QueueProcessor {
  @Process('welcome')
  async handleWelcomeEmail(job: Job<{ email: string; name: string }>) {
    const { email, name } = job.data;
    console.log(`📨 Отправка письма пользователю ${name} на адрес ${email}`);
    // Здесь реальный код отправки (nodemailer, sendgrid и т.д.)
    // Имитация задержки:
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`✅ Письмо отправлено для ${email}`);
    return { success: true };
  }
}
