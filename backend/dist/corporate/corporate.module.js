"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorporateModule = void 0;
const common_1 = require("@nestjs/common");
const corporate_controller_1 = require("./corporate.controller");
const corporate_service_1 = require("./corporate.service");
const contacts_module_1 = require("../contacts/contacts.module");
const subsidiaries_module_1 = require("../subsidiaries/subsidiaries.module");
const contacts_service_1 = require("../contacts/contacts.service");
const subsidiaries_service_1 = require("../subsidiaries/subsidiaries.service");
let CorporateModule = class CorporateModule {
};
exports.CorporateModule = CorporateModule;
exports.CorporateModule = CorporateModule = __decorate([
    (0, common_1.Module)({
        imports: [contacts_module_1.ContactsModule, subsidiaries_module_1.SubsidiariesModule],
        controllers: [corporate_controller_1.CorporateController],
        providers: [corporate_service_1.CorporateService, contacts_service_1.ContactsService, subsidiaries_service_1.SubsidiariesService],
        exports: [corporate_service_1.CorporateService],
    })
], CorporateModule);
//# sourceMappingURL=corporate.module.js.map