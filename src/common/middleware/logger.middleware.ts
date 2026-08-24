import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, url } = req;
    const start = Date.now();
    res.on('finish', () => {
      console.log(
        `[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} - ${Date.now() - start}ms`,
      );
    });
    next();
  }
}
