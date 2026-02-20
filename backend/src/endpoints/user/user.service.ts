import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProfileDto } from 'src/dto/create_user.dto';
import { MembershipPlan } from 'src/entities/member_plan.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createProfile(
    createProfileDto: CreateProfileDto,
    user: { id: string; email: string },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { membershipPlanId, ...rest } = createProfileDto;
    const userToCreate = { ...user, ...rest } as User;

    try {
      const user = queryRunner.manager.create(User, userToCreate);

      const savedUser = await queryRunner.manager.save(user);

      const plan = await queryRunner.manager.findOne(MembershipPlan, {
        where: { id: membershipPlanId },
      });

      console.log(plan);
    } catch (error) {
      console.log(error);
    } finally {
      // Release the runner
      await queryRunner.release();
    }
  }

  async fetchLoggedUser(userId: string) {
    console.log('User Id:', userId);
    return await this.userRepo.findOne({ where: { id: userId } });
  }
}
