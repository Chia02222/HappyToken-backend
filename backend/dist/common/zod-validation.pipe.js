"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
let ZodValidationPipe = class ZodValidationPipe {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    transform(value, _metadata) {
        void _metadata;
        const result = this.schema.safeParse(value);
        if (!result.success) {
            const zerr = result.error;
            const message = zerr.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
            try {
                const preview = typeof value === 'object' ? Object.keys(value || {}) : String(value).slice(0, 200);
                console.error('[ZodValidationPipe] Validation failed. Keys/preview:', preview, 'Issues:', message);
            }
            catch { }
            throw new common_1.BadRequestException(message);
        }
        return result.data;
    }
};
exports.ZodValidationPipe = ZodValidationPipe;
exports.ZodValidationPipe = ZodValidationPipe = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [Function])
], ZodValidationPipe);
//# sourceMappingURL=zod-validation.pipe.js.map