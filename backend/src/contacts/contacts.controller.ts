import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactTable } from '../database/types';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async findAll(
    @Query('corporate_id') corporateId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.contactsService.findAll({
      corporate_id: corporateId ? Number(corporateId) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.contactsService.findById(id);
  }

  @Post()
  async create(
    @Body() body: Omit<ContactTable, 'id' | 'created_at' | 'updated_at'>
  ) {
    return await this.contactsService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Omit<ContactTable, 'id' | 'created_at'>>,
  ) {
    return await this.contactsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.contactsService.delete(id);
  }
}


