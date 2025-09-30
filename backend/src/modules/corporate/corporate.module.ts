import { Module, forwardRef } from '@nestjs/common';
import { CorporateController } from './corporate.controller';
import { CorporateService } from './corporate.service';
import { ContactsModule } from '../contacts/contacts.module';
import { SubsidiariesModule } from '../subsidiaries/subsidiaries.module';
import { ContactsService } from '../contacts/contacts.service';
import { SubsidiariesService } from '../subsidiaries/subsidiaries.service';
import { ResendModule } from '../resend/resend.module';
import { PdfService } from './pdf.service';

@Module({
  imports: [ContactsModule, SubsidiariesModule, forwardRef(() => ResendModule)],
  controllers: [CorporateController],
  providers: [CorporateService, ContactsService, SubsidiariesService, PdfService],
  exports: [CorporateService],
})
export class CorporateModule {}