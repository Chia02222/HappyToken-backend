"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendModule = void 0;
const common_1 = require("@nestjs/common");
const resend_service_1 = require("./resend.service");
const corporate_module_1 = require("../corporate/corporate.module");
let ResendModule = class ResendModule {
};
exports.ResendModule = ResendModule;
exports.ResendModule = ResendModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => corporate_module_1.CorporateModule)],
        providers: [resend_service_1.ResendService],
        exports: [resend_service_1.ResendService],
    })
], ResendModule);
//# sourceMappingURL=resend.module.js.map