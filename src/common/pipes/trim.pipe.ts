import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'object' && value !== null) {
      // рекурсивно обрезаем строки во всех полях объекта
      const trimmed = {};
      for (const [key, val] of Object.entries(value)) {
        trimmed[key] = typeof val === 'string' ? val.trim() : val;
      }
      return trimmed;
    }
    return value;
  }
}
