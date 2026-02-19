import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateMembershipPlanDto } from 'src/dto/create_membership_plan.dto';
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
}
