import { SeedService } from './seed/seed.service';
import { databaseService } from './database/database.service';

async function bootstrap() {
  try {
    // Initialize database
    await databaseService.initialize();
    
    const seeder = new SeedService();
    await seeder.seedDatabase();
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Database seeding failed:', error);
  }
}

bootstrap();
