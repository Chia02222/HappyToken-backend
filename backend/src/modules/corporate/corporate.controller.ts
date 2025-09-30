import { Controller, Get, Post, Put, Delete, Patch, Body, Param, HttpException, HttpStatus, Query, ParseUUIDPipe, Res } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { ResendService } from '../resend/resend.service';
import { PdfService } from './pdf.service';
import { buildAgreementHtml } from './pdf.template';
import { InvestigationLogTable } from '../../database/types';
import { CreateCorporateWithRelationsDto, UpdateCorporateDto, createCorporateSchema, updateCorporateSchema, updateStatusSchema, investigationLogSchema } from './dto/corporate.dto';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('corporates')
export class CorporateController {
  constructor(
    private readonly corporateService: CorporateService,
    private readonly resendService: ResendService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  async findAll() {
    return await this.corporateService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.corporateService.findById(id);
  }

  @Get(':id/pdf')
  async getCorporatePdf(@Param('id', new ParseUUIDPipe()) id: string, @Res() res: any) {
    const corp = await this.corporateService.findById(id);
    if (!corp) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    const html = buildAgreementHtml(corp);
    const pdf = await this.pdfService.renderAgreementPdf(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(corp.company_name || 'Corporate').replace(/[^a-zA-Z0-9 _.-]/g,'-')} - Happy Token.pdf"`);
    res.end(Buffer.from(pdf));
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createCorporateSchema)) corporateData: CreateCorporateWithRelationsDto & { investigation_log?: InvestigationLogTable; id?: string }) {
    const { investigation_log: _investigation_log, id: _id, ...corporateDataWithoutLogAndId } = corporateData;
    const dataToPassToService: CreateCorporateWithRelationsDto = corporateDataWithoutLogAndId;
    return await this.corporateService.create(dataToPassToService);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(updateCorporateSchema)) updateData: UpdateCorporateDto
  ) {
    return await this.corporateService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.corporateService.delete(id);
  }

  @Post(':id/investigation-logs')
  async addInvestigationLog(
    @Param('id', new ParseUUIDPipe()) corporateId: string,
    @Body(new ZodValidationPipe(investigationLogSchema)) logData: Omit<InvestigationLogTable, 'id' | 'corporate_id' | 'created_at'>
  ) {
    return await this.corporateService.addInvestigationLog(corporateId, logData);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(updateStatusSchema)) body: { status: string; note?: string }
  ) {
    return await this.corporateService.updateStatus(id, body.status, body.note);
  }

  // Amendment Request Endpoints
  @Post(':id/amendment-requests')
  async createAmendmentRequest(
    @Param('id', new ParseUUIDPipe()) corporateId: string,
    @Body() amendmentData: {
      requestedChanges: string;
      amendmentReason: string;
      submittedBy: string;
      originalData: any;
      amendedData: any;
    }
  ) {
    return await this.corporateService.createAmendmentRequest(corporateId, amendmentData);
  }

  @Patch(':id/amendment-requests/:amendmentId')
  async updateAmendmentStatus(
    @Param('id', new ParseUUIDPipe()) corporateId: string,
    @Param('amendmentId', new ParseUUIDPipe()) amendmentId: string,
    @Body() body: { status: 'approved' | 'rejected'; reviewNotes?: string }
  ) {
    return await this.corporateService.updateAmendmentStatus(corporateId, amendmentId, body.status, body.reviewNotes);
  }

  @Get('amendment-requests')
  async getAmendmentRequests(@Query('corporateId') corporateId?: string) {
    return await this.corporateService.getAmendmentRequests(corporateId);
  }

  @Get(':id/amendment-requests')
  async getAmendmentRequestsByCorporate(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.corporateService.getAmendmentRequests(id);
  }

  @Get('amendment-requests/:amendmentId')
  async getAmendmentById(@Param('amendmentId', new ParseUUIDPipe()) amendmentId: string) {
    return await this.corporateService.getAmendmentById(amendmentId);
  }

  @Put(':id/submit')
  async submitForFirstApproval(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.corporateService.updateStatus(id, 'Pending 1st Approval', 'Submitted to 1st approver.');
  }

  @Post(':id/resend-link')
  async sendEcommericialTermlink(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('approver') approver: 'first' | 'second' = 'first',
  ) {
    const result = await this.resendService.sendEcommericialTermlink(id, approver);
    if (result.success) {
      if (approver === 'first') {
        await this.corporateService.updateStatus(id, 'Pending 1st Approval', 'Registration link sent to 1st approver.');
      } else {
        // For second approver, ensure status reflects second approval pending
        await this.corporateService.updateStatus(id, 'Pending 2nd Approval', 'Registration link sent to 2nd approver.');
      }
      return result;
    } else {
      throw new HttpException(result.message || 'Failed to send e-Commercial link.', HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/complete-cooling-period')
  async completeCoolingPeriod(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.corporateService.handleCoolingPeriodCompletion(id);
  }

  @Post(':id/send-amendment-email')
  async sendAmendmentEmail(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.resendService.sendAmendmentRequestEmail(id);
  }

  @Post(':id/send-amend-reject-email')
  async sendAmendRejectEmail(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: { note?: string }) {
    return await this.resendService.sendAmendRejectEmail(id, body.note);
  }
}
