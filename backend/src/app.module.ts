import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CorporateModule } from './modules/corporate/corporate.module';
import { SeedModule } from './seed/seed.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { SubsidiariesModule } from './modules/subsidiaries/subsidiaries.module';
import { ResendModule } from './modules/resend/resend.module';

@Module({
  imports: [DatabaseModule, CorporateModule, ContactsModule, SubsidiariesModule, SeedModule, ResendModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}