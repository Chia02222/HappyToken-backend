import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { SubsidiariesService } from './subsidiaries.service';
import { SubsidiaryTable } from '../database/types';

@Controller('subsidiaries')
export class SubsidiariesController {
  constructor(private readonly subsidiariesService: SubsidiariesService) {}

  @Get()
  async findAll(
    @Query('corporate_id') corporateId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.subsidiariesService.findAll({
      corporate_id: corporateId ? String(corporateId) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: string) {
    return await this.subsidiariesService.findById(id);
  }

  @Post()
  async create(
    @Body() body: Omit<SubsidiaryTable, 'id' | 'created_at' | 'updated_at'>
  ) {
    return await this.subsidiariesService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() body: Partial<Omit<SubsidiaryTable, 'id' | 'created_at'>>,
  ) {
    return await this.subsidiariesService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: string) {
    return await this.subsidiariesService.delete(id);
  }
}


