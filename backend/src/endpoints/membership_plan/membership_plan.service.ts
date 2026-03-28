import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMembershipPlanDto } from 'src/dto/create_membership_plan.dto';
import { UpdateMembershipPlanDto } from 'src/dto/update_membership_plan.dto';
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

  async getById(id: string) {
    const plan = await this.membershipPlanRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Membership plan not found');
    return plan;
  }

  async updatePlan(
    id: string,
    updateMembershipPlanDto: UpdateMembershipPlanDto,
  ) {
    const plan = await this.getById(id);
    Object.assign(plan, updateMembershipPlanDto);
    return this.membershipPlanRepo.save(plan);
  }

  async deletePlan(id: string) {
    await this.getById(id);
    await this.membershipPlanRepo.softDelete(id);
    return { message: 'Plan deleted successfully' };
  }
}
