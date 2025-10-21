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
import { Controller, Post, Put, Delete } from '@nestjs/common';
let ContactsController = (() => {
    let _classDecorators = [Controller('contacts')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _addContact_decorators;
    let _updateContact_decorators;
    let _deleteContact_decorators;
    var ContactsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _addContact_decorators = [Post(':corporateUuid')];
            _updateContact_decorators = [Put(':uuid')];
            _deleteContact_decorators = [Delete(':uuid')];
            __esDecorate(this, null, _addContact_decorators, { kind: "method", name: "addContact", static: false, private: false, access: { has: obj => "addContact" in obj, get: obj => obj.addContact }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateContact_decorators, { kind: "method", name: "updateContact", static: false, private: false, access: { has: obj => "updateContact" in obj, get: obj => obj.updateContact }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteContact_decorators, { kind: "method", name: "deleteContact", static: false, private: false, access: { has: obj => "deleteContact" in obj, get: obj => obj.deleteContact }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ContactsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        contactsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(contactsService) {
            this.contactsService = contactsService;
        }
        async addContact(corporateUuid, contactData) {
            return await this.contactsService.addContact({ ...contactData, corporate_uuid: corporateUuid });
        }
        async updateContact(uuid, contactData) {
            return await this.contactsService.updateContact(uuid, contactData);
        }
        async deleteContact(uuid) {
            return await this.contactsService.deleteContact(uuid);
        }
    };
    return ContactsController = _classThis;
})();
export { ContactsController };
//# sourceMappingURL=contacts.controller.js.map