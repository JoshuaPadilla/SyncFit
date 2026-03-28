import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateMembershipPlanDto } from 'src/dto/create_membership_plan.dto';
import { UpdateMembershipPlanDto } from 'src/dto/update_membership_plan.dto';
import { MembershipPlanService } from './membership_plan.service';

@Controller('membership-plan')
export class MembershipPlanController {
  constructor(private readonly membershipPlanService: MembershipPlanService) {}

  @Get()
  getAll() {
    return this.membershipPlanService.getAll();
  }

  @Post()
  createMembershipPlan(
    @Body() createMembershipPlanDto: CreateMembershipPlanDto,
  ) {
    return this.membershipPlanService.createMembershipPlan(
      createMembershipPlanDto,
    );
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.membershipPlanService.getById(id);
  }

  @Patch(':id')
  updatePlan(
    @Param('id') id: string,
    @Body() updateMembershipPlanDto: UpdateMembershipPlanDto,
  ) {
    return this.membershipPlanService.updatePlan(id, updateMembershipPlanDto);
  }

  @Delete(':id')
  deletePlan(@Param('id') id: string) {
    return this.membershipPlanService.deletePlan(id);
  }
}
