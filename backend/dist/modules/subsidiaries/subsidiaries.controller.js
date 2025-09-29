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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubsidiariesController = void 0;
const common_1 = require("@nestjs/common");
const subsidiaries_service_1 = require("./subsidiaries.service");
const subsidiary_dto_1 = require("./dto/subsidiary.dto");
const zod_validation_pipe_1 = require("../../common/zod-validation.pipe");
let SubsidiariesController = class SubsidiariesController {
    subsidiariesService;
    constructor(subsidiariesService) {
        this.subsidiariesService = subsidiariesService;
    }
    async addSubsidiary(corporateUuid, subsidiaryData) {
        return await this.subsidiariesService.addSubsidiary({ ...subsidiaryData, corporate_uuid: corporateUuid });
    }
    async updateSubsidiary(uuid, subsidiaryData) {
        return await this.subsidiariesService.updateSubsidiary(String(uuid), subsidiaryData);
    }
    async deleteSubsidiary(uuid) {
        return await this.subsidiariesService.deleteSubsidiary(String(uuid));
    }
};
exports.SubsidiariesController = SubsidiariesController;
__decorate([
    (0, common_1.Post)(':corporateUuid'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(subsidiary_dto_1.createSubsidiarySchema.omit({ corporate_id: true }))),
    __param(0, (0, common_1.Param)('corporateUuid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "addSubsidiary", null);
__decorate([
    (0, common_1.Put)(':uuid'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(subsidiary_dto_1.updateSubsidiarySchema)),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, subsidiary_dto_1.UpdateSubsidiaryDto]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "updateSubsidiary", null);
__decorate([
    (0, common_1.Delete)(':uuid'),
    __param(0, (0, common_1.Param)('uuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "deleteSubsidiary", null);
exports.SubsidiariesController = SubsidiariesController = __decorate([
    (0, common_1.Controller)('subsidiaries'),
    __metadata("design:paramtypes", [subsidiaries_service_1.SubsidiariesService])
], SubsidiariesController);
//# sourceMappingURL=subsidiaries.controller.js.map