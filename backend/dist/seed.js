"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const seed_service_1 = require("./seed/seed.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const seeder = app.get(seed_service_1.SeedService);
    try {
        await seeder.seedDatabase();
        console.log('Database seeding completed successfully.');
    }
    catch (error) {
        console.error('Database seeding failed:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed.js.map