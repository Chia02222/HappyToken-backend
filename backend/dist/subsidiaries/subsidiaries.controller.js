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
let SubsidiariesController = class SubsidiariesController {
    subsidiariesService;
    constructor(subsidiariesService) {
        this.subsidiariesService = subsidiariesService;
    }
    async addSubsidiary(corporateId, subsidiaryData) {
        return await this.subsidiariesService.addSubsidiary({ ...subsidiaryData, corporate_id: corporateId });
    }
    async updateSubsidiary(id, subsidiaryData) {
        return await this.subsidiariesService.updateSubsidiary(Number(id), subsidiaryData);
    }
    async deleteSubsidiary(id) {
        return await this.subsidiariesService.deleteSubsidiary(Number(id));
    }
};
exports.SubsidiariesController = SubsidiariesController;
__decorate([
    (0, common_1.Post)(':corporateId'),
    __param(0, (0, common_1.Param)('corporateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "addSubsidiary", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, subsidiary_dto_1.UpdateSubsidiaryDto]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "updateSubsidiary", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "deleteSubsidiary", null);
exports.SubsidiariesController = SubsidiariesController = __decorate([
    (0, common_1.Controller)('subsidiaries'),
    __metadata("design:paramtypes", [subsidiaries_service_1.SubsidiariesService])
], SubsidiariesController);
//# sourceMappingURL=subsidiaries.controller.js.map