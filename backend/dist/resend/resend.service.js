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
exports.ResendService = void 0;
const common_1 = require("@nestjs/common");
const corporate_service_1 = require("../corporate/corporate.service");
let ResendService = class ResendService {
    corporateService;
    constructor(corporateService) {
        this.corporateService = corporateService;
    }
    async sendCustomEmail(to, subject, html) {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const SENDER_EMAIL = process.env.SENDER_EMAIL;
        if (!RESEND_API_KEY || !SENDER_EMAIL) {
            console.error('Resend API Key or Sender Email is not configured.');
            return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
        }
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: SENDER_EMAIL,
                    to: to,
                    subject: subject,
                    html: html,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('Failed to send custom email via Resend:', data);
                return { success: false, message: data.message || 'Failed to send custom email.' };
            }
            console.log(`Custom email sent to ${to} with subject: ${subject}`);
            return { success: true, message: `Custom email sent to ${to}.` };
        }
        catch (error) {
            console.error('Error sending custom email via Resend:', error);
            return { success: false, message: 'Error sending custom email.' };
        }
    }
    async resendRegistrationLink(id) {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const SENDER_EMAIL = process.env.SENDER_EMAIL;
        if (!RESEND_API_KEY || !SENDER_EMAIL) {
            console.error('Resend API Key or Sender Email is not configured.');
            return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
        }
        const corporate = await this.corporateService.findById(id);
        if (!corporate) {
            return { success: false, message: 'Corporate not found.' };
        }
        let recipientEmail = corporate.contacts?.[0]?.email;
        if (recipientEmail) {
            recipientEmail = recipientEmail.replace(/[^a-zA-Z0-9._%+-@]/g, '');
        }
        if (!recipientEmail || recipientEmail === 'N/A' || recipientEmail === '') {
            return { success: false, message: 'Recipient email not found or is invalid for corporate.' };
        }
        const sanitizedCorporateId = corporate.id.replace(/[^a-zA-Z0-9]/g, '');
        const registrationLink = `https://happietoken.com/register?token=${Buffer.from(`corp_${sanitizedCorporateId}`).toString('base64')}`;
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: SENDER_EMAIL,
                    to: recipientEmail,
                    subject: 'Your Registration Link',
                    html: `<p>Click <a href="${registrationLink}">here</a> to register</p>`,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('Failed to send email via Resend:', data);
                return { success: false, message: data.message || 'Failed to send email.' };
            }
            console.log(`Email sent to ${recipientEmail} for corporate ID: ${id}`);
            return { success: true, message: `Registration link resent to ${recipientEmail}.` };
        }
        catch (error) {
            console.error('Error sending email via Resend:', error);
            return { success: false, message: 'Error sending email.' };
        }
    }
};
exports.ResendService = ResendService;
exports.ResendService = ResendService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => corporate_service_1.CorporateService))),
    __metadata("design:paramtypes", [corporate_service_1.CorporateService])
], ResendService);
//# sourceMappingURL=resend.service.js.map