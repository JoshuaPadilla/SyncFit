import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntryLogByMemberQueryDto } from 'src/dto/queries_dto/entry_log_by_member_query.dto';
import { EntryLogQueryDto } from 'src/dto/queries_dto/entry_log_query.dto';
import { EntryLog } from 'src/entities/entry_log.entity';
import { Member } from 'src/entities/member.entity';
import { EntryStatus } from 'src/enums/entry_status.enum';
import { MembershipStatus } from 'src/enums/membership_status.enum';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class EntryLogService {
  constructor(
    @InjectRepository(EntryLog)
    private readonly entryLogRepository: Repository<EntryLog>,
    private readonly dataSource: DataSource,
  ) {}

  async getEntryLogsByMember(query: EntryLogByMemberQueryDto) {
    const {
      memberId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 5,
      search,
    } = query;

    const qb = this.entryLogRepository
      .createQueryBuilder('entryLog')
      .innerJoinAndSelect('entryLog.member', 'member')
      .where('member.id = :memberId', { memberId });

    if (status) {
      qb.andWhere('entryLog.status = :status', { status });
    }

    if (startDate) {
      qb.andWhere('entryLog.entryTime >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      qb.andWhere('entryLog.entryTime <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (search) {
      qb.andWhere(
        new Brackets((orQb) => {
          orQb
            .where('CAST(entryLog.deniedReason AS TEXT) ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('entryLog.rfidUid ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('user.firstName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    qb.orderBy('entryLog.entryTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async fetchAll(query: EntryLogQueryDto) {
    const { status, startDate, endDate, page = 1, limit = 5, search } = query;

    const qb = this.entryLogRepository
      .createQueryBuilder('entryLog')
      .innerJoinAndSelect('entryLog.member', 'member')
      .innerJoinAndSelect('member.user', 'user')
      .innerJoinAndSelect('member.membershipPlan', 'membershipPlan');

    if (status) {
      qb.andWhere('entryLog.status = :status', { status });
    }

    if (startDate) {
      qb.andWhere('entryLog.entryTime >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      qb.andWhere('entryLog.entryTime <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (search) {
      qb.andWhere(
        new Brackets((orQb) => {
          orQb
            .where('CAST(entryLog.deniedReason AS TEXT) ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('entryLog.rfidUid ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('user.firstName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    qb.orderBy('entryLog.entryTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInsights() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Total Entries Today
    const totalEntriesToday = await this.dataSource
      .createQueryBuilder(EntryLog, 'log')
      .where('log.status = :status', { status: EntryStatus.GRANTED })
      .andWhere('log.entryTime BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .getCount();

    // 2. Active Members
    const activeMembers = await this.dataSource
      .createQueryBuilder(Member, 'member')
      .where('member.status = :status', { status: MembershipStatus.ACTIVE })
      .getCount();

    // 3. Denied Attempts
    const deniedAttempts = await this.dataSource
      .createQueryBuilder(EntryLog, 'log')
      .where('log.status = :status', { status: EntryStatus.DENIED })
      .andWhere('log.entryTime BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .getCount();

    // 4. Peak Hour
    const peakHourResult = await this.dataSource
      .createQueryBuilder(EntryLog, 'log')
      .select('EXTRACT(HOUR FROM log.entryTime)', 'hour')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.entryTime BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere('log.status = :status', { status: EntryStatus.GRANTED })
      .groupBy('hour')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      totalEntriesToday,
      activeMembers,
      deniedAttempts,
      peakHour: peakHourResult ? parseInt(peakHourResult.hour) : null,
    };
  }
}
