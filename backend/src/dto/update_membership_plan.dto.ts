import { PartialType } from '@nestjs/mapped-types';
import { CreateMembershipPlanDto } from './create_membership_plan.dto';

export class UpdateMembershipPlanDto extends PartialType(
  CreateMembershipPlanDto,
) {}
