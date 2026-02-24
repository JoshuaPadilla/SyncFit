import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProfileDto } from 'src/dto/create_user.dto';
import { UserQueryDto } from 'src/dto/queries_dto/user_query_.dto';
import { EntryLog } from 'src/entities/entry_log.entity';
import { User } from 'src/entities/user.entity';
import { EntryStatus } from 'src/enums/entry_status.enum';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(EntryLog)
    private readonly entryLogRepo: Repository<EntryLog>,
    private dataSource: DataSource,
  ) {}

  async createProfile(
    createProfileDto: CreateProfileDto,
    user: { id: string; email: string },
  ) {
    const newUser = this.userRepo.create({ ...createProfileDto, ...user });

    return await this.userRepo.save(newUser);
  }

  async fetchLoggedUser(userId: string) {
    return await this.userRepo.findOne({
      where: { id: userId },
      relations: ['member', 'member.membershipPlan'],
    });
  }

  async getUserDashboardInsights(userId: string) {
    // 1. Fetch User and Member in one go using standard Repository
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['member'],
    });

    if (!user?.member) throw new NotFoundException('Member profile not found');
    const memberId = user.member.id;

    // 2. Fetch only necessary data (SUCCESSFUL logs only)
    const logs = await this.entryLogRepo.find({
      where: { member: { id: memberId }, status: EntryStatus.GRANTED },
      order: { entryTime: 'DESC' },
      select: ['entryTime'],
    });

    if (logs.length === 0) {
      return { streak: 0, lastVisit: null };
    }

    // 3. Extract unique dates (YYYY-MM-DD)
    const uniqueDates = [
      ...new Set(logs.map((log) => log.entryTime.toISOString().split('T')[0])),
    ];

    // 4. Calculate Streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const visitDate = new Date(uniqueDates[i]);
      visitDate.setHours(0, 0, 0, 0);

      // Calculate difference in days from "Today"
      const diffInDays = Math.floor(
        (today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Check if the visit is part of a continuous sequence
      // streak 0: must be today (0) or yesterday (1)
      // streak 1: must be the day before the last checked date
      if (diffInDays <= streak + 1) {
        streak++;
      } else {
        break;
      }
    }

    return {
      streak,
      lastVisit: logs[0].entryTime,
      totalVisits: logs.length,
    };
  }

  async fetchAllUsers(id: string, query: UserQueryDto) {
    console.log(1);
    const {
      page = 1,
      limit = 5,
      search,
      status,
      membershipType,
      isExpired,
      minBalance,
      maxBalance,
    } = query;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.member', 'member')
      .leftJoinAndSelect('member.membershipPlan', 'membershipPlan')
      .where('user.id != :id', { id })
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (status) {
      qb.andWhere('member.status = :status', { status });
    }

    if (membershipType) {
      qb.andWhere('membershipPlan.type = :membershipType', { membershipType });
    }

    if (isExpired !== undefined) {
      const now = new Date();
      if (isExpired) {
        qb.andWhere('member.expirationDate < :now', { now });
      } else {
        qb.andWhere('member.expirationDate >= :now', { now });
      }
    }

    if (minBalance !== undefined) {
      qb.andWhere('member.balance >= :minBalance', { minBalance });
    }

    if (maxBalance !== undefined) {
      qb.andWhere('member.balance <= :maxBalance', { maxBalance });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
