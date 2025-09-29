import { Controller, Post, Put, Delete, Body, Param, UsePipes } from '@nestjs/common';
import { SubsidiariesService } from './subsidiaries.service';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto, createSubsidiarySchema, updateSubsidiarySchema } from './dto/subsidiary.dto';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('subsidiaries')
export class SubsidiariesController {
  constructor(private readonly subsidiariesService: SubsidiariesService) {}

  @Post(':corporateUuid')
  @UsePipes(new ZodValidationPipe(createSubsidiarySchema.omit({ corporate_id: true })))
  async addSubsidiary(
    @Param('corporateUuid') corporateUuid: string,
    @Body() subsidiaryData: Omit<CreateSubsidiaryDto, 'corporate_id'>
  ) {
    return await this.subsidiariesService.addSubsidiary({ ...subsidiaryData, corporate_uuid: corporateUuid } as any);
  }

  @Put(':uuid')
  @UsePipes(new ZodValidationPipe(updateSubsidiarySchema))
  async updateSubsidiary(
    @Param('uuid') uuid: string,
    @Body() subsidiaryData: UpdateSubsidiaryDto
  ) {
    return await this.subsidiariesService.updateSubsidiary(String(uuid), subsidiaryData);
  }

  @Delete(':uuid')
  async deleteSubsidiary(@Param('uuid') uuid: string) {
    return await this.subsidiariesService.deleteSubsidiary(String(uuid));
  }
}
