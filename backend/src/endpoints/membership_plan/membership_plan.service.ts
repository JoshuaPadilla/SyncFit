import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMembershipPlanDto } from 'src/dto/create_membership_plan.dto';
import { MembershipPlan } from 'src/entities/membership_plan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembershipPlanService {
  constructor(
    @InjectRepository(MembershipPlan)
    private membershipPlanRepo: Repository<MembershipPlan>,
  ) {}

  async getAll() {
    return this.membershipPlanRepo.find();
  }

  async createMembershipPlan(createMembershipPlanDto: CreateMembershipPlanDto) {
    const plan = this.membershipPlanRepo.create(createMembershipPlanDto);

    return await this.membershipPlanRepo.save(plan);
  }
}
