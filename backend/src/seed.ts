import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeedService);

  try {
    await seeder.seedDatabase();
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
