import * as NestCommon from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import type { ZodType, ZodError } from 'zod';
import { Injectable } from '@nestjs/common';
type ArgumentMetadata = NestCommon.ArgumentMetadata;
type PipeTransform = NestCommon.PipeTransform;
// no value import to satisfy isolatedModules

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType<unknown>) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    // Mark metadata as intentionally unused to satisfy linter
    void _metadata;
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const zerr = result.error as ZodError;
      const message = zerr.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      try {
        // Debug log to help identify offending payloads
        const preview = typeof value === 'object' ? Object.keys(value || {}) : String(value).slice(0, 200);
        console.error('[ZodValidationPipe] Validation failed. Keys/preview:', preview, 'Issues:', message);
      } catch {}
      throw new BadRequestException(message);
    }
    return result.data;
  }
}


