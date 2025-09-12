import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { CorporateTable, InvestigationLogTable } from '../database/types';
import { UpdateCorporateDto } from './dto/corporate.dto';

@Controller('corporates')
export class CorporateController {
  constructor(private readonly corporateService: CorporateService) {}

  @Get()
  async findAll() {
    return await this.corporateService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.corporateService.findById(id);
  }

  @Post()
  async create(@Body() corporateData: Omit<CorporateTable, 'id'>) {
    return await this.corporateService.create(corporateData);
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
}