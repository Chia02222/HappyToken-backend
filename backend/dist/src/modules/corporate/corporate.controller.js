var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Controller, Get, Post, Put, Delete, Patch, HttpException, HttpStatus } from '@nestjs/common';
let CorporateController = (() => {
    let _classDecorators = [Controller('corporates')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findById_decorators;
    let _getCorporatePdf_decorators;
    let _create_decorators;
    let _update_decorators;
    let _delete_decorators;
    let _addInvestigationLog_decorators;
    let _updateStatus_decorators;
    let _createAmendmentRequest_decorators;
    let _updateAmendmentStatus_decorators;
    let _getAmendmentRequests_decorators;
    let _getAmendmentRequestsByCorporate_decorators;
    let _getAmendmentById_decorators;
    let _submitForFirstApproval_decorators;
    let _sendEcommericialTermlink_decorators;
    let _completeCoolingPeriod_decorators;
    let _sendAmendmentEmail_decorators;
    let _sendAmendRejectEmail_decorators;
    let _updatePinnedStatus_decorators;
    var CorporateController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [Get()];
            _findById_decorators = [Get(':id')];
            _getCorporatePdf_decorators = [Get(':id/pdf')];
            _create_decorators = [Post()];
            _update_decorators = [Put(':id')];
            _delete_decorators = [Delete(':id')];
            _addInvestigationLog_decorators = [Post(':id/investigation-logs')];
            _updateStatus_decorators = [Put(':id/status')];
            _createAmendmentRequest_decorators = [Post(':id/amendment-requests')];
            _updateAmendmentStatus_decorators = [Patch(':id/amendment-requests/:amendmentId')];
            _getAmendmentRequests_decorators = [Get('amendment-requests')];
            _getAmendmentRequestsByCorporate_decorators = [Get(':id/amendment-requests')];
            _getAmendmentById_decorators = [Get('amendment-requests/:amendmentId')];
            _submitForFirstApproval_decorators = [Put(':id/submit')];
            _sendEcommericialTermlink_decorators = [Post(':id/resend-link')];
            _completeCoolingPeriod_decorators = [Post(':id/complete-cooling-period')];
            _sendAmendmentEmail_decorators = [Post(':id/send-amendment-email')];
            _sendAmendRejectEmail_decorators = [Post(':id/send-amend-reject-email')];
            _updatePinnedStatus_decorators = [Put(':id/pinned')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getCorporatePdf_decorators, { kind: "method", name: "getCorporatePdf", static: false, private: false, access: { has: obj => "getCorporatePdf" in obj, get: obj => obj.getCorporatePdf }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _addInvestigationLog_decorators, { kind: "method", name: "addInvestigationLog", static: false, private: false, access: { has: obj => "addInvestigationLog" in obj, get: obj => obj.addInvestigationLog }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: obj => "updateStatus" in obj, get: obj => obj.updateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createAmendmentRequest_decorators, { kind: "method", name: "createAmendmentRequest", static: false, private: false, access: { has: obj => "createAmendmentRequest" in obj, get: obj => obj.createAmendmentRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateAmendmentStatus_decorators, { kind: "method", name: "updateAmendmentStatus", static: false, private: false, access: { has: obj => "updateAmendmentStatus" in obj, get: obj => obj.updateAmendmentStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAmendmentRequests_decorators, { kind: "method", name: "getAmendmentRequests", static: false, private: false, access: { has: obj => "getAmendmentRequests" in obj, get: obj => obj.getAmendmentRequests }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAmendmentRequestsByCorporate_decorators, { kind: "method", name: "getAmendmentRequestsByCorporate", static: false, private: false, access: { has: obj => "getAmendmentRequestsByCorporate" in obj, get: obj => obj.getAmendmentRequestsByCorporate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAmendmentById_decorators, { kind: "method", name: "getAmendmentById", static: false, private: false, access: { has: obj => "getAmendmentById" in obj, get: obj => obj.getAmendmentById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _submitForFirstApproval_decorators, { kind: "method", name: "submitForFirstApproval", static: false, private: false, access: { has: obj => "submitForFirstApproval" in obj, get: obj => obj.submitForFirstApproval }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendEcommericialTermlink_decorators, { kind: "method", name: "sendEcommericialTermlink", static: false, private: false, access: { has: obj => "sendEcommericialTermlink" in obj, get: obj => obj.sendEcommericialTermlink }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _completeCoolingPeriod_decorators, { kind: "method", name: "completeCoolingPeriod", static: false, private: false, access: { has: obj => "completeCoolingPeriod" in obj, get: obj => obj.completeCoolingPeriod }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendAmendmentEmail_decorators, { kind: "method", name: "sendAmendmentEmail", static: false, private: false, access: { has: obj => "sendAmendmentEmail" in obj, get: obj => obj.sendAmendmentEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendAmendRejectEmail_decorators, { kind: "method", name: "sendAmendRejectEmail", static: false, private: false, access: { has: obj => "sendAmendRejectEmail" in obj, get: obj => obj.sendAmendRejectEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updatePinnedStatus_decorators, { kind: "method", name: "updatePinnedStatus", static: false, private: false, access: { has: obj => "updatePinnedStatus" in obj, get: obj => obj.updatePinnedStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CorporateController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        corporateService = __runInitializers(this, _instanceExtraInitializers);
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
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            const feBase = process.env.FRONTEND_BASE_URL;
            if (!feBase) {
                throw new HttpException('FRONTEND_BASE_URL is not configured on the server', HttpStatus.INTERNAL_SERVER_ERROR);
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
                throw new HttpException(result.message || 'Failed to send e-Commercial link.', HttpStatus.BAD_REQUEST);
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
    return CorporateController = _classThis;
})();
export { CorporateController };
//# sourceMappingURL=corporate.controller.js.map