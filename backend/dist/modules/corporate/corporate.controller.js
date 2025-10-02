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
const resend_service_1 = require("../resend/resend.service");
const pdf_service_1 = require("./pdf.service");
const corporate_dto_1 = require("./dto/corporate.dto");
const zod_validation_pipe_1 = require("../../common/zod-validation.pipe");
let CorporateController = class CorporateController {
    corporateService;
    resendService;
    pdfService;
    constructor(corporateService, resendService, pdfService) {
        this.corporateService = corporateService;
        this.resendService = resendService;
        this.pdfService = pdfService;
    }
    async findAll() {
        return await this.corporateService.findAll();
    }
    async findById(id) {
        return await this.corporateService.findById(id);
    }
    async getCorporatePdf(id, res) {
        const corp = await this.corporateService.findById(id);
        if (!corp)
            throw new common_1.HttpException('Not found', common_1.HttpStatus.NOT_FOUND);
        const feBase = process.env.FRONTEND_BASE_URL;
        if (!feBase) {
            throw new common_1.HttpException('FRONTEND_BASE_URL is not configured on the server', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const pdf = await this.pdfService.renderAgreementPdfFromUrl(feBase, id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${(corp.company_name || 'Corporate').replace(/[^a-zA-Z0-9 _.-]/g, '-')} - Happie Token.pdf"`);
        res.end(Buffer.from(pdf));
    }
    async create(corporateData) {
        const { investigation_log: _investigation_log, id: _id, ...corporateDataWithoutLogAndId } = corporateData;
        const dataToPassToService = corporateDataWithoutLogAndId;
        return await this.corporateService.create(dataToPassToService);
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
    async createAmendmentRequest(corporateId, amendmentData) {
        return await this.corporateService.createAmendmentRequest(corporateId, amendmentData);
    }
    async updateAmendmentStatus(corporateId, amendmentId, body) {
        return await this.corporateService.updateAmendmentStatus(corporateId, amendmentId, body.status, body.reviewNotes);
    }
    async getAmendmentRequests(corporateId) {
        return await this.corporateService.getAmendmentRequests(corporateId);
    }
    async getAmendmentRequestsByCorporate(id) {
        return await this.corporateService.getAmendmentRequests(id);
    }
    async getAmendmentById(amendmentId) {
        return await this.corporateService.getAmendmentById(amendmentId);
    }
    async submitForFirstApproval(id) {
        return;
    }
    async sendEcommericialTermlink(id, approver = 'first') {
        const result = await this.resendService.sendEcommericialTermlink(id, approver);
        if (result.success) {
            if (approver === 'first') {
                await this.corporateService.updateStatus(id, 'Pending 1st Approval', 'Registration link sent to 1st approver.');
            }
            else {
                await this.corporateService.updateStatus(id, 'Pending 2nd Approval', 'Registration link sent to 2nd approver.');
            }
            return result;
        }
        else {
            throw new common_1.HttpException(result.message || 'Failed to send e-Commercial link.', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async completeCoolingPeriod(id) {
        return await this.corporateService.handleCoolingPeriodCompletion(id);
    }
    async sendAmendmentEmail(id) {
        return await this.resendService.sendAmendmentRequestEmail(id);
    }
    async sendAmendRejectEmail(id, body) {
        return await this.resendService.sendAmendRejectEmail(id, body.note);
    }
    async updatePinnedStatus(id, body) {
        return await this.corporateService.updatePinnedStatus(id, body.pinned);
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
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "getCorporatePdf", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(corporate_dto_1.createCorporateSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(corporate_dto_1.updateCorporateSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, corporate_dto_1.UpdateCorporateDto]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/investigation-logs'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(corporate_dto_1.investigationLogSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "addInvestigationLog", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(corporate_dto_1.updateStatusSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/amendment-requests'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "createAmendmentRequest", null);
__decorate([
    (0, common_1.Patch)(':id/amendment-requests/:amendmentId'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)('amendmentId', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "updateAmendmentStatus", null);
__decorate([
    (0, common_1.Get)('amendment-requests'),
    __param(0, (0, common_1.Query)('corporateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "getAmendmentRequests", null);
__decorate([
    (0, common_1.Get)(':id/amendment-requests'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "getAmendmentRequestsByCorporate", null);
__decorate([
    (0, common_1.Get)('amendment-requests/:amendmentId'),
    __param(0, (0, common_1.Param)('amendmentId', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "getAmendmentById", null);
__decorate([
    (0, common_1.Put)(':id/submit'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "submitForFirstApproval", null);
__decorate([
    (0, common_1.Post)(':id/resend-link'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Query)('approver')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "sendEcommericialTermlink", null);
__decorate([
    (0, common_1.Post)(':id/complete-cooling-period'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "completeCoolingPeriod", null);
__decorate([
    (0, common_1.Post)(':id/send-amendment-email'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "sendAmendmentEmail", null);
__decorate([
    (0, common_1.Post)(':id/send-amend-reject-email'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "sendAmendRejectEmail", null);
__decorate([
    (0, common_1.Put)(':id/pinned'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "updatePinnedStatus", null);
exports.CorporateController = CorporateController = __decorate([
    (0, common_1.Controller)('corporates'),
    __metadata("design:paramtypes", [corporate_service_1.CorporateService,
        resend_service_1.ResendService,
        pdf_service_1.PdfService])
], CorporateController);
//# sourceMappingURL=corporate.controller.js.map