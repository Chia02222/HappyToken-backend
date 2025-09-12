import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SubsidiariesService } from './subsidiaries.service';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto } from './dto/subsidiary.dto';

@Controller('subsidiaries')
export class SubsidiariesController {
  constructor(private readonly subsidiariesService: SubsidiariesService) {}

  @Post(':corporateId')
  async addSubsidiary(
    @Param('corporateId') corporateId: string,
    @Body() subsidiaryData: Omit<CreateSubsidiaryDto, 'corporate_id'>
  ) {
    return await this.subsidiariesService.addSubsidiary({ ...subsidiaryData, corporate_id: corporateId });
  }

  @Put(':id')
  async updateSubsidiary(
    @Param('id') id: string,
    @Body() subsidiaryData: UpdateSubsidiaryDto
  ) {
    return await this.subsidiariesService.updateSubsidiary(id, subsidiaryData);
  }

  @Delete(':id')
  async deleteSubsidiary(@Param('id') id: string) {
    return await this.subsidiariesService.deleteSubsidiary(id);
  }
}
