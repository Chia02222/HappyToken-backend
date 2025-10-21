import { Elysia } from 'elysia';
import { CorporateService } from './corporate.service';
import { ResendService } from '../resend/resend.service';
import { PdfService } from './pdf.service';
import { createCorporateSchema, updateCorporateSchema, updateStatusSchema, investigationLogSchema } from './dto/corporate.dto';
const corporateService = new CorporateService();
const resendService = new ResendService();
const pdfService = new PdfService();
corporateService['resendService'] = resendService;
resendService['corporateService'] = corporateService;
export const corporateRoutes = new Elysia({ prefix: '/corporates' })
    .get('/', async () => {
    return await corporateService.findAll();
})
    .get('/:id', async ({ params: { id } }) => {
    return await corporateService.findById(id);
})
    .get('/:id/pdf', async ({ params: { id }, set }) => {
    const corp = await corporateService.findById(id);
    if (!corp) {
        set.status = 404;
        return { error: 'Not found' };
    }
    const feBase = process.env.FRONTEND_BASE_URL;
    if (!feBase) {
        set.status = 500;
        return { error: 'FRONTEND_BASE_URL is not configured on the server' };
    }
    const pdf = await pdfService.renderAgreementPdfFromUrl(feBase, id);
    set.headers = {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(corp.company_name || 'Corporate').replace(/[^a-zA-Z0-9 _.-]/g, '-')} - Happie Token.pdf"`
    };
    return new Response(Buffer.from(pdf));
})
    .post('/', async ({ body }) => {
    const validatedData = createCorporateSchema.parse(body);
    const { investigation_log: _investigation_log, id: _id, ...corporateDataWithoutLogAndId } = validatedData;
    return await corporateService.create(corporateDataWithoutLogAndId);
})
    .put('/:id', async ({ params: { id }, body }) => {
    const validatedData = updateCorporateSchema.parse(body);
    return await corporateService.update(id, validatedData);
})
    .delete('/:id', async ({ params: { id } }) => {
    return await corporateService.delete(id);
})
    .post('/:id/investigation-logs', async ({ params: { id: corporateId }, body }) => {
    const validatedData = investigationLogSchema.parse(body);
    return await corporateService.addInvestigationLog(corporateId, validatedData);
})
    .put('/:id/status', async ({ params: { id }, body }) => {
    const validatedData = updateStatusSchema.parse(body);
    return await corporateService.updateStatus(id, validatedData.status, validatedData.note);
})
    .post('/:id/amendment-requests', async ({ params: { id: corporateId }, body }) => {
    return await corporateService.createAmendmentRequest(corporateId, body);
})
    .patch('/:id/amendment-requests/:amendmentId', async ({ params: { id: corporateId, amendmentId }, body }) => {
    const { status, reviewNotes } = body;
    return await corporateService.updateAmendmentStatus(corporateId, amendmentId, status, reviewNotes);
})
    .get('/amendment-requests', async ({ query: { corporateId } }) => {
    return await corporateService.getAmendmentRequests(corporateId);
})
    .get('/:id/amendment-requests', async ({ params: { id } }) => {
    return await corporateService.getAmendmentRequests(id);
})
    .get('/amendment-requests/:amendmentId', async ({ params: { amendmentId } }) => {
    return await corporateService.getAmendmentById(amendmentId);
})
    .put('/:id/submit', async ({ params: { id } }) => {
    return;
})
    .post('/:id/resend-link', async ({ params: { id }, query: { approver = 'first' } }) => {
    const result = await resendService.sendEcommericialTermlink(id, approver);
    if (result.success) {
        if (approver === 'first') {
            await corporateService.updateStatus(id, 'Pending 1st Approval', 'Registration link sent to 1st approver.');
        }
        else {
            await corporateService.updateStatus(id, 'Pending 2nd Approval', 'Registration link sent to 2nd approver.');
        }
        return result;
    }
    else {
        throw new Error(result.message || 'Failed to send e-Commercial link.');
    }
})
    .post('/:id/complete-cooling-period', async ({ params: { id } }) => {
    return await corporateService.handleCoolingPeriodCompletion(id);
})
    .post('/:id/send-amendment-email', async ({ params: { id } }) => {
    return await resendService.sendAmendmentRequestEmail(id);
})
    .post('/:id/send-amend-reject-email', async ({ params: { id }, body }) => {
    const { note } = body;
    return await resendService.sendAmendRejectEmail(id, note);
})
    .put('/:id/pinned', async ({ params: { id }, body }) => {
    const { pinned } = body;
    return await corporateService.updatePinnedStatus(id, pinned);
});
//# sourceMappingURL=corporate.routes.js.map