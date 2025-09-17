import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from  './dto/contact.dto'

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post(':corporateId')
  async addContact(
    @Param('corporateId') corporateId: string,
    @Body() contactData: Omit<CreateContactDto, 'corporate_id'>
  ) {
    return await this.contactsService.addContact({ ...contactData, corporate_id: corporateId });
  }

  @Put(':id')
  async updateContact(
    @Param('id') id: string,
    @Body() contactData: UpdateContactDto
  ) {
    return await this.contactsService.updateContact(id, contactData);
  }

  @Delete(':id')
  async deleteContact(@Param('id') id: string) {
    return await this.contactsService.deleteContact(id);
  }
}
