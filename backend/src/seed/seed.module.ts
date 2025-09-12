import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { CorporateModule } from '../corporate/corporate.module';
import { ContactsModule } from '../contacts/contacts.module';
import { SubsidiariesModule } from '../subsidiaries/subsidiaries.module';

@Module({
  imports: [CorporateModule, ContactsModule, SubsidiariesModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}