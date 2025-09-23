import * as NestCommon from '@nestjs/common';
import type { ZodType } from 'zod';
type ArgumentMetadata = NestCommon.ArgumentMetadata;
type PipeTransform = NestCommon.PipeTransform;
export declare class ZodValidationPipe implements PipeTransform {
    private schema;
    constructor(schema: ZodType<any>);
    transform(value: any, _metadata: ArgumentMetadata): any;
}
export {};
