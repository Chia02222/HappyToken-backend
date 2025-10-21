import { Elysia } from 'elysia';
import { databaseService } from './database/database.service';
export const appRoutes = new Elysia()
    .get('/', () => {
    return { message: 'HappyToken Backend API is running!' };
})
    .get('/health', async () => {
    try {
        await databaseService.getSql() `SELECT 1 as test`;
        return {
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString(),
        };
    }
});
//# sourceMappingURL=app.routes.js.map