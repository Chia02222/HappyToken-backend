import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SubsidiariesService } from './subsidiaries.service';
import { SubsidiariesController } from './subsidiaries.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [SubsidiariesController],
  providers: [SubsidiariesService],
  exports: [SubsidiariesService],
})
export class SubsidiariesModule {}


