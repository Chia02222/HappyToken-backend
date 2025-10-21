import { Elysia } from 'elysia';
import { ContactsService } from './contacts.service';
import { createContactSchema, updateContactSchema } from './dto/contact.dto';

const contactsService = new ContactsService();

export const contactsRoutes = new Elysia({ prefix: '/contacts' })
  .get('/', async () => {
    return await contactsService.findAll();
  })
  
  .get('/:uuid', async ({ params: { uuid } }) => {
    return await contactsService.findById(uuid);
  })
  
  .post('/:corporateUuid', async ({ params: { corporateUuid }, body }) => {
    const validatedData = createContactSchema.omit({ corporate_id: true }).parse(body);
    return await contactsService.addContact({ ...validatedData, corporate_uuid: corporateUuid });
  })
  
  .put('/:uuid', async ({ params: { uuid }, body }) => {
    const validatedData = updateContactSchema.parse(body);
    return await contactsService.updateContact(uuid, validatedData as any);
  })
  
  .delete('/:uuid', async ({ params: { uuid } }) => {
    return await contactsService.deleteContact(uuid);
  });
