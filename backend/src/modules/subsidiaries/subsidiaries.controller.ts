import { Controller, Post, Put, Delete, Body, Param, UsePipes } from '@nestjs/common';
import { SubsidiariesService } from './subsidiaries.service';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto, createSubsidiarySchema, updateSubsidiarySchema } from './dto/subsidiary.dto';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('subsidiaries')
export class SubsidiariesController {
  constructor(private readonly subsidiariesService: SubsidiariesService) {}

  @Post(':corporateId')
  @UsePipes(new ZodValidationPipe(createSubsidiarySchema.omit({ corporate_id: true })))
  async addSubsidiary(
    @Param('corporateId') corporateId: number,
    @Body() subsidiaryData: Omit<CreateSubsidiaryDto, 'corporate_id'>
  ) {
    return await this.subsidiariesService.addSubsidiary({ ...subsidiaryData, corporate_id: corporateId });
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(updateSubsidiarySchema))
  async updateSubsidiary(
    @Param('id') id: string,
    @Body() subsidiaryData: UpdateSubsidiaryDto
  ) {
    return await this.subsidiariesService.updateSubsidiary(Number(id), subsidiaryData);
  }

  @Delete(':id')
  async deleteSubsidiary(@Param('id') id: string) {
    return await this.subsidiariesService.deleteSubsidiary(Number(id));
  }
}
