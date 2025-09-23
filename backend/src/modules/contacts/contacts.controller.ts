import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, createContactSchema, updateContactSchema } from  './dto/contact.dto'
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post(':corporateId')
  async addContact(
    @Param('corporateId') corporateId: string,
    @Body(new ZodValidationPipe(createContactSchema.omit({ corporate_id: true }))) contactData: Omit<CreateContactDto, 'corporate_id'>
  ) {
    const corporateIdNum = Number(corporateId);
    return await this.contactsService.addContact({ ...contactData, corporate_id: corporateIdNum });
  }

  @Put(':id')
  async updateContact(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateContactSchema)) contactData: UpdateContactDto
  ) {
    return await this.contactsService.updateContact(Number(id), contactData);
  }

  @Delete(':id')
  async deleteContact(@Param('id') id: string) {
    return await this.contactsService.deleteContact(Number(id));
  }
}
