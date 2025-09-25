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
const corporate_dto_1 = require("./dto/corporate.dto");
const zod_validation_pipe_1 = require("../../common/zod-validation.pipe");
let CorporateController = class CorporateController {
    corporateService;
    resendService;
    constructor(corporateService, resendService) {
        this.corporateService = corporateService;
        this.resendService = resendService;
    }
    async findAll() {
        return await this.corporateService.findAll();
    }
    async findById(id) {
        return await this.corporateService.findById(id);
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
    async submitForFirstApproval(id) {
        return await this.corporateService.updateStatus(id, 'Pending 1st Approval', 'Submitted to 1st approver.');
    }
    async resendRegistrationLink(id) {
        const result = await this.resendService.resendRegistrationLink(id);
        if (result.success) {
            await this.corporateService.updateStatus(id, 'Pending 1st Approval', 'Registration link resent, status updated to Pending 1st Approval.');
        }
        return result;
    }
    async completeCoolingPeriod(id) {
        return await this.corporateService.handleCoolingPeriodCompletion(id);
    }
    async sendAmendmentEmail(id, body) {
        const corporate = await this.corporateService.findById(id);
        if (!corporate) {
            throw new Error('Corporate not found');
        }
        const subject = `Action Required: Amendment Request for ${corporate.company_name}`;
        const corporateLink = `http://localhost:3000/corporate/${id}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Action Required: Amendment Request</h2>
        <p>Hi ${body.crtName},</p>
        <p>An amendment request has been submitted and requires your action.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Request Details:</h3>
          <p><strong>Requested Changes:</strong> ${body.requestedChanges}</p>
          <p><strong>Reason:</strong> ${body.amendmentReason}</p>
          <p><strong>Requested By:</strong> ${body.approverName}</p>
          <p><strong>Created By:</strong> ${body.crtName}</p>
        </div>
        
        <p>You can review and update the request by clicking the link below:</p>
        <p><a href="${corporateLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Amendment Request</a></p>
        
        <p>Thank you,<br>Happy Token Team</p>
      </div>
    `;
        const crtEmail = process.env.CRT_EMAIL || 'wanjun123@1utar.my';
        return await this.resendService.sendCustomEmail(crtEmail, subject, html);
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
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(corporate_dto_1.createCorporateSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(corporate_dto_1.updateCorporateSchema))),
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
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(corporate_dto_1.investigationLogSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "addInvestigationLog", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(corporate_dto_1.updateStatusSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "submitForFirstApproval", null);
__decorate([
    (0, common_1.Post)(':id/resend-link'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "resendRegistrationLink", null);
__decorate([
    (0, common_1.Post)(':id/complete-cooling-period'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "completeCoolingPeriod", null);
__decorate([
    (0, common_1.Post)(':id/send-amendment-email'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorporateController.prototype, "sendAmendmentEmail", null);
exports.CorporateController = CorporateController = __decorate([
    (0, common_1.Controller)('corporates'),
    __metadata("design:paramtypes", [corporate_service_1.CorporateService,
        resend_service_1.ResendService])
], CorporateController);
//# sourceMappingURL=corporate.controller.js.map