import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { ResendService } from '../resend/resend.service';
import { InvestigationLogTable } from '../../database/types';
import { CreateCorporateWithRelationsDto, UpdateCorporateDto, createCorporateSchema, updateCorporateSchema, updateStatusSchema, investigationLogSchema } from './dto/corporate.dto';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('corporates')
export class CorporateController {
  constructor(
    private readonly corporateService: CorporateService,
    private readonly resendService: ResendService,
  ) {}

  @Get()
  async findAll() {
    return await this.corporateService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.corporateService.findById(id);
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createCorporateSchema)) corporateData: CreateCorporateWithRelationsDto & { investigation_log?: InvestigationLogTable; id?: string }) {
    const { investigation_log: _investigation_log, id: _id, ...corporateDataWithoutLogAndId } = corporateData;
    const dataToPassToService: CreateCorporateWithRelationsDto = corporateDataWithoutLogAndId;
    return await this.corporateService.create(dataToPassToService);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCorporateSchema)) updateData: UpdateCorporateDto
  ) {
    return await this.corporateService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.corporateService.delete(id);
  }

  @Post(':id/investigation-logs')
  async addInvestigationLog(
    @Param('id') corporateId: string,
    @Body(new ZodValidationPipe(investigationLogSchema)) logData: Omit<InvestigationLogTable, 'id' | 'corporate_id' | 'created_at'>
  ) {
    return await this.corporateService.addInvestigationLog(corporateId, logData);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStatusSchema)) body: { status: string; note?: string }
  ) {
    return await this.corporateService.updateStatus(id, body.status, body.note);
  }

  @Put(':id/submit')
  async submitForFirstApproval(
    @Param('id') id: string,
  ) {
    return await this.corporateService.updateStatus(id, 'Pending 1st Approval', 'Submitted to 1st approver.');
  }

  @Post(':id/resend-link')
  async resendRegistrationLink(@Param('id') id: string) {
    const result = await this.resendService.resendRegistrationLink(id);
    if (result.success) {
      // Update corporate status to 'Approval (1st)' after successfully sending the link
      await this.corporateService.updateStatus(id, 'Pending 1st Approval', 'Registration link resent, status updated to Pending 1st Approval.');
    }
    return result;
  }

  @Post(':id/complete-cooling-period')
  async completeCoolingPeriod(@Param('id') id: string) {
    return await this.corporateService.handleCoolingPeriodCompletion(id);
  }

  @Post(':id/send-amendment-email')
  async sendAmendmentEmail(
    @Param('id') id: string,
    @Body() body: { requestedChanges: string; amendmentReason: string; approverName: string; crtName: string }
  ) {
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

    // Send email to CRT team (you can configure the CRT email address)
    const crtEmail = process.env.CRT_EMAIL || 'wanjun123@1utar.my';
    return await this.resendService.sendCustomEmail(crtEmail, subject, html);
  }
}
