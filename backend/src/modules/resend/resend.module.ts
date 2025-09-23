import { Module, forwardRef } from '@nestjs/common';
import { ResendService } from './resend.service';
import { CorporateModule } from '../corporate/corporate.module';

@Module({
  imports: [forwardRef(() => CorporateModule)],
  providers: [ResendService],
  exports: [ResendService],
})
export class ResendModule {}
