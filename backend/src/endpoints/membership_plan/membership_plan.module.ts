import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPlan } from 'src/entities/member_plan.entity';
import { MembershipPlanController } from './membership_plan.controller';
import { MembershipPlanService } from './membership_plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipPlan])],
  controllers: [MembershipPlanController],
  providers: [MembershipPlanService],
})
export class MembershipPlanModule {}
