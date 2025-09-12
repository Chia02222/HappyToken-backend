import { Module } from '@nestjs/common';
import { CorporateController } from './corporate.controller';
import { CorporateService } from './corporate.service';
import { ContactsModule } from '../contacts/contacts.module';
import { SubsidiariesModule } from '../subsidiaries/subsidiaries.module';
import { ContactsService } from '../contacts/contacts.service';
import { SubsidiariesService } from '../subsidiaries/subsidiaries.service';

@Module({
  imports: [ContactsModule, SubsidiariesModule],
  controllers: [CorporateController],
  providers: [CorporateService, ContactsService, SubsidiariesService],
  exports: [CorporateService],
})
export class CorporateModule {}