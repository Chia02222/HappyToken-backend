import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CorporateModule } from './corporate/corporate.module';
import { SeedModule } from './seed/seed.module';
import { ContactsModule } from './contacts/contacts.module';
import { SubsidiariesModule } from './subsidiaries/subsidiaries.module';

@Module({
  imports: [DatabaseModule, CorporateModule, ContactsModule, SubsidiariesModule, SeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}