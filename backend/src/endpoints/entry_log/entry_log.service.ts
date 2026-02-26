import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntryLogByMemberQueryDto } from 'src/dto/queries_dto/entry_log_by_member_query.dto';
import { EntryLogQueryDto } from 'src/dto/queries_dto/entry_log_query.dto';
import { EntryLog } from 'src/entities/entry_log.entity';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class EntryLogService {
  constructor(
    @InjectRepository(EntryLog)
    private readonly entryLogRepository: Repository<EntryLog>,
  ) {}

  async getEntryLogsByMember(query: EntryLogByMemberQueryDto) {
    console.log(query);
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

    console.log(data);

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
}
