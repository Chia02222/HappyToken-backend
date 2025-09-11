import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { Database, CorporateTable, ContactTable, SubsidiaryTable, InvestigationLogTable } from '../database/types';

@Controller('corporates')
export class CorporateController {
  constructor(private readonly corporateService: CorporateService) {}

  @Get()
  async findAll() {
    return await this.corporateService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.corporateService.findById(id);
  }

  @Post()
  async create(@Body() corporateData: Omit<CorporateTable, 'id' | 'created_at' | 'updated_at'>) {
    return await this.corporateService.create(corporateData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Omit<CorporateTable, 'id' | 'created_at'>>
  ) {
    return await this.corporateService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.corporateService.delete(id);
  }

  @Post(':id/contacts')
  async addContact(
    @Param('id', ParseIntPipe) corporateId: number,
    @Body() contactData: Omit<ContactTable, 'id' | 'corporate_id' | 'created_at' | 'updated_at'>
  ) {
    return await this.corporateService.addContact(corporateId, contactData);
  }

  @Post(':id/subsidiaries')
  async addSubsidiary(
    @Param('id', ParseIntPipe) corporateId: number,
    @Body() subsidiaryData: Omit<SubsidiaryTable, 'id' | 'corporate_id' | 'created_at' | 'updated_at'>
  ) {
    return await this.corporateService.addSubsidiary(corporateId, subsidiaryData);
  }

  @Post(':id/investigation-logs')
  async addInvestigationLog(
    @Param('id', ParseIntPipe) corporateId: number,
    @Body() logData: Omit<InvestigationLogTable, 'id' | 'corporate_id' | 'created_at'>
  ) {
    return await this.corporateService.addInvestigationLog(corporateId, logData);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; note?: string }
  ) {
    return await this.corporateService.updateStatus(id, body.status, body.note);
  }
}
