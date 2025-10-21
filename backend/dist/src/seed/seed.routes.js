import { Elysia } from 'elysia';
import { SeedService } from './seed.service';
import { CorporateService } from '../modules/corporate/corporate.service';
const seedService = new SeedService();
const corporateService = new CorporateService();
seedService['corporateService'] = corporateService;
export const seedRoutes = new Elysia({ prefix: '/seed' })
    .get('/', async () => {
    return { message: 'Seed service is available. Use POST to seed the database.' };
})
    .post('/', async () => {
    await seedService.seedDatabase();
    return { message: 'Database seeded successfully' };
});
//# sourceMappingURL=seed.routes.js.map