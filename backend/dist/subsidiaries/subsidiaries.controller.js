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
let SubsidiariesController = class SubsidiariesController {
    subsidiariesService;
    constructor(subsidiariesService) {
        this.subsidiariesService = subsidiariesService;
    }
    async findAll(corporateId, limit, offset) {
        return await this.subsidiariesService.findAll({
            corporate_id: corporateId ? Number(corporateId) : undefined,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
        });
    }
    async findById(id) {
        return await this.subsidiariesService.findById(id);
    }
    async create(body) {
        return await this.subsidiariesService.create(body);
    }
    async update(id, body) {
        return await this.subsidiariesService.update(id, body);
    }
    async delete(id) {
        return await this.subsidiariesService.delete(id);
    }
};
exports.SubsidiariesController = SubsidiariesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('corporate_id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubsidiariesController.prototype, "delete", null);
exports.SubsidiariesController = SubsidiariesController = __decorate([
    (0, common_1.Controller)('subsidiaries'),
    __metadata("design:paramtypes", [subsidiaries_service_1.SubsidiariesService])
], SubsidiariesController);
//# sourceMappingURL=subsidiaries.controller.js.map