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
import { Controller, Post, Put, Delete, UsePipes } from '@nestjs/common';
import { createSubsidiarySchema, updateSubsidiarySchema } from './dto/subsidiary.dto';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
let SubsidiariesController = (() => {
    let _classDecorators = [Controller('subsidiaries')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _addSubsidiary_decorators;
    let _updateSubsidiary_decorators;
    let _deleteSubsidiary_decorators;
    var SubsidiariesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _addSubsidiary_decorators = [Post(':corporateUuid'), UsePipes(new ZodValidationPipe(createSubsidiarySchema.omit({ corporate_id: true })))];
            _updateSubsidiary_decorators = [Put(':uuid'), UsePipes(new ZodValidationPipe(updateSubsidiarySchema))];
            _deleteSubsidiary_decorators = [Delete(':uuid')];
            __esDecorate(this, null, _addSubsidiary_decorators, { kind: "method", name: "addSubsidiary", static: false, private: false, access: { has: obj => "addSubsidiary" in obj, get: obj => obj.addSubsidiary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSubsidiary_decorators, { kind: "method", name: "updateSubsidiary", static: false, private: false, access: { has: obj => "updateSubsidiary" in obj, get: obj => obj.updateSubsidiary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteSubsidiary_decorators, { kind: "method", name: "deleteSubsidiary", static: false, private: false, access: { has: obj => "deleteSubsidiary" in obj, get: obj => obj.deleteSubsidiary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SubsidiariesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        subsidiariesService = __runInitializers(this, _instanceExtraInitializers);
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
    return SubsidiariesController = _classThis;
})();
export { SubsidiariesController };
//# sourceMappingURL=subsidiaries.controller.js.map