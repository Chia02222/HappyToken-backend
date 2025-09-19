import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { ResendService } from '../resend/resend.service';
import { CorporateTable, InvestigationLogTable } from '../database/types';
import { CreateCorporateWithRelationsDto, UpdateCorporateDto } from './dto/corporate.dto';

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
  async create(@Body() corporateData: any) {
    const { investigation_log, id, ...corporateDataWithoutLogAndId } = corporateData;
    const dataToPassToService: CreateCorporateWithRelationsDto = corporateDataWithoutLogAndId;
    return await this.corporateService.create(dataToPassToService);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateCorporateDto
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
    @Body() logData: Omit<InvestigationLogTable, 'id' | 'corporate_id' | 'created_at'>
  ) {
    return await this.corporateService.addInvestigationLog(corporateId, logData);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; note?: string }
  ) {
    return await this.corporateService.updateStatus(id, body.status, body.note);
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
  }}
