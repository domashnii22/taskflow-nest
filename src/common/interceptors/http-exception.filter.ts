import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      const responseObj = exception.getResponse();
      statusCode = exception.getStatus();
      message =
        typeof responseObj === 'string'
          ? responseObj
          : (responseObj as any).message || responseObj;
      error = exception.name || 'Error';
    } else {
      // Неизвестная ошибка (например, системная)
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Unknown Error';
    }

    // Приводим message к строке (если массив)
    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
