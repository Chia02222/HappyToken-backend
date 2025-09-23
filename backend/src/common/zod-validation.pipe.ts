import * as NestCommon from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import type { ZodType, ZodError } from 'zod';
import { Injectable } from '@nestjs/common';
type ArgumentMetadata = NestCommon.ArgumentMetadata;
type PipeTransform = NestCommon.PipeTransform;
// no value import to satisfy isolatedModules

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType<any>) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const zerr = result.error as ZodError;
      const message = zerr.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new BadRequestException(message);
    }
    return result.data;
  }
}


