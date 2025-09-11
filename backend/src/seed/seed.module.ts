import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { CorporateModule } from '../corporate/corporate.module';

@Module({
  imports: [CorporateModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
