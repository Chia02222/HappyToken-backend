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
exports.CorporateController = void 0;
const common_1 = require("@nestjs/common");
const corporate_service_1 = require("./corporate.service");
const corporate_dto_1 = require("./dto/corporate.dto");
let CorporateController = class CorporateController {
    corporateService;
    constructor(corporateService) {
        this.corporateService = corporateService;
    }
    async findAll() {
        return await this.corporateService.findAll();
    }
    async findById(id) {
        return await this.corporateService.findById(id);
    }
    async create(corporateData) {
        return await this.corporateService.create(corporateData);
    }
    async update(id, updateData) {
        return await this.corporateService.update(id, updateData);
    }
    async delete(id) {
        return await this.corporateService.delete(id);
    }
    async addInvestigationLog(corporateId, logData) {
        return await this.corporateService.addInvestigationLog(corporateId, logData);
    }
    async updateStatus(id, body) {
        return await this.corporateService.updateStatus(id, body.status, body.note);
    }
};
exports.CorporateController = CorporateController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, corporate_dto_1.UpdateCorporateDto]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/investigation-logs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "addInvestigationLog", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "updateStatus", null);
exports.CorporateController = CorporateController = __decorate([
    (0, common_1.Controller)('corporates'),
    __metadata("design:paramtypes", [corporate_service_1.CorporateService])
], CorporateController);
//# sourceMappingURL=corporate.controller.js.map