import { Elysia } from 'elysia';
import { SubsidiariesService } from './subsidiaries.service';
import { createSubsidiarySchema, updateSubsidiarySchema } from './dto/subsidiary.dto';
const subsidiariesService = new SubsidiariesService();
export const subsidiariesRoutes = new Elysia({ prefix: '/subsidiaries' })
    .get('/', async () => {
    return await subsidiariesService.findAll();
})
    .get('/:uuid', async ({ params: { uuid } }) => {
    return await subsidiariesService.findById(uuid);
})
    .post('/:corporateUuid', async ({ params: { corporateUuid }, body }) => {
    const validatedData = createSubsidiarySchema.omit({ corporate_id: true }).parse(body);
    return await subsidiariesService.addSubsidiary({ ...validatedData, corporate_uuid: corporateUuid });
})
    .put('/:uuid', async ({ params: { uuid }, body }) => {
    const validatedData = updateSubsidiarySchema.parse(body);
    return await subsidiariesService.updateSubsidiary(uuid, validatedData);
})
    .delete('/:uuid', async ({ params: { uuid } }) => {
    return await subsidiariesService.deleteSubsidiary(uuid);
});
//# sourceMappingURL=subsidiaries.routes.js.map