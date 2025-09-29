import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, createContactSchema, updateContactSchema } from  './dto/contact.dto'
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post(':corporateUuid')
  async addContact(
    @Param('corporateUuid') corporateUuid: string,
    @Body(new ZodValidationPipe(createContactSchema.omit({ corporate_id: true }))) contactData: Omit<CreateContactDto, 'corporate_id'>
  ) {
    return await this.contactsService.addContact({ ...contactData, corporate_uuid: corporateUuid });
  }

  @Put(':uuid')
  async updateContact(
    @Param('uuid') uuid: string,
    @Body(new ZodValidationPipe(updateContactSchema)) contactData: UpdateContactDto
  ) {
    return await this.contactsService.updateContact(uuid, contactData);
  }

  @Delete(':uuid')
  async deleteContact(@Param('uuid') uuid: string) {
    return await this.contactsService.deleteContact(uuid);
  }
}
