import { Elysia } from 'elysia';
import { appRoutes } from '../src/app.routes';
describe('AppController (e2e)', () => {
    let app;
    beforeEach(async () => {
        app = new Elysia().use(appRoutes);
    });
    it('/ (GET)', async () => {
        const response = await app.handle(new Request('http://localhost:3001/'));
        const data = await response.json();
        expect(data.message).toBe('HappyToken Backend API is running!');
    });
});
//# sourceMappingURL=app.e2e-spec.js.map