import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EntryLog } from 'src/entities/entry_log.entity';
import { Member } from 'src/entities/member.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { DeniedReason } from 'src/enums/denied_reason.enum';
import { EntryStatus } from 'src/enums/entry_status.enum';
import { MembershipStatus } from 'src/enums/membership_status.enum';
import { MembershipType } from 'src/enums/membership_type.enum';
import { TransactionType } from 'src/enums/transaction_types.enum';
import { Between, DataSource } from 'typeorm';

@Injectable()
export class RfidService implements OnModuleInit {
  private entryFee = 50; // Example fee for prepaid members
  private registrationMode = false;
  private registrationUserId: string | null = null;
  private registrationTimeout: NodeJS.Timeout | null = null;

  constructor(
    @Inject('MQTT_SERVICE') private client: ClientProxy,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async handleRfidTap(uid: string) {
    // ✅ If we are in registration mode
    if (this.registrationUserId) {
      try {
        await this.saveRfid(uid, this.registrationUserId);
      } catch (err) {
        console.error('RFID Registration Failed:', err.message);

        this.client.emit(`rfid/registration/${this.registrationUserId}`, {
          uid: uid,
          status: 'error',
          message: err.message,
        });
        return;
      }

      this.client.emit(`rfid/registration/${this.registrationUserId}`, {
        uid: uid,
        status: 'success',
        message: 'RFID Registered Successfully',
      });

      // Clear timeout
      if (this.registrationTimeout) {
        clearTimeout(this.registrationTimeout);
        this.registrationTimeout = null;
      }

      this.registrationUserId = null;

      return { status: 'RFID Registered' };
    }

    // Normal access check
    const isAllowed = await this.checkAccess(uid);

    if (isAllowed) {
      this.client.emit('gym/door/command', 'unlock');
      return { status: 'Access Granted' };
    }

    return { status: 'Access Denied' };
  }

  async startRegistration(userId: string) {
    if (this.registrationTimeout) {
      clearTimeout(this.registrationTimeout);
    }

    this.registrationMode = true;
    this.registrationUserId = userId;

    this.registrationTimeout = setTimeout(() => {
      this.client.emit(`rfid/registration/${userId}`, {
        uid: null,
        status: 'expired',
        message: 'Registration mode expired',
      });

      this.registrationUserId = null;
      this.registrationTimeout = null;
      this.registrationMode = false;

      console.log(`Registration expired for user: ${userId}`);
    }, 30000); // Changed to 30s as per your comment (2000 is only 2 seconds)

    return { status: 'Waiting for RFID tap...' };
  }

  async cancelRegistration() {
    if (this.registrationTimeout) {
      clearTimeout(this.registrationTimeout);
      this.registrationTimeout = null;
    }
    this.registrationMode = false;
    this.registrationUserId = null;
  }

  async getInsights() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Total Entries Today
    const totalEntries = await this.dataSource
      .getRepository(EntryLog)
      .createQueryBuilder('log')
      .where('log.status = :status', { status: EntryStatus.GRANTED })
      .andWhere('log.entryTime >= :today', { today })
      .getCount();

    // 2. Active Members
    const activeMembers = await this.dataSource
      .getRepository(Member)
      .createQueryBuilder('member')
      .where('member.status = :status', { status: MembershipStatus.ACTIVE })
      .getCount();

    // 3. Denied Attempts Today
    const deniedAttempts = await this.dataSource
      .getRepository(EntryLog)
      .createQueryBuilder('log')
      .where('log.status = :status', { status: EntryStatus.DENIED })
      .andWhere('log.entryTime >= :today', { today })
      .getCount();

    // 4. Peak Hour Today
    // Note: Use HOUR(log.entryTime) for MySQL or EXTRACT(HOUR FROM log.entryTime) for PostgreSQL
    const peakHourResult = await this.dataSource
      .getRepository(EntryLog)
      .createQueryBuilder('log')
      .select('HOUR(log.entryTime)', 'hour')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.status = :status', { status: EntryStatus.GRANTED })
      .andWhere('log.entryTime >= :today', { today })
      .groupBy('hour')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      totalEntriesToday: totalEntries,
      activeMembersCount: activeMembers,
      deniedAttemptsToday: deniedAttempts,
      peakHour: peakHourResult ? parseInt(peakHourResult.hour) : null,
    };
  }

  private async saveRfid(uid: string, userId: string) {
    const memberRepo = this.dataSource.getRepository(Member);

    const existingMember = await memberRepo.findOne({
      where: { rfidUid: uid },
    });

    if (existingMember) {
      throw new Error('This RFID UID is already registered to another member.');
    }
    const member = await memberRepo.findOne({
      where: { user: { id: userId } },
    });
    if (member) {
      member.rfidUid = uid;
      await memberRepo.save(member);
    }
  }

  private async checkAccess(uid: string): Promise<boolean> {
    // Use .transaction() to get rid of all the manual connect/commit/release code
    return await this.dataSource
      .transaction(async (manager) => {
        const member = await manager.findOne(Member, {
          where: { rfidUid: uid },
          relations: ['membershipPlan'],
        });

        if (!member) {
          console.log(`No member found for UID: ${uid}`);
          return false;
        }

        // Prepare the log (don't save yet)

        const newEntryLog = manager.create(EntryLog, { rfidUid: uid, member });
        const plan = member.membershipPlan;

        // 1. Validation Checks
        let denialReason: DeniedReason | null = null;

        if (!plan) denialReason = DeniedReason.UNKNOWN_CARD;
        else if (member.status !== MembershipStatus.ACTIVE)
          denialReason = DeniedReason.INACTIVE;
        else if (
          plan.type === MembershipType.PREPAID &&
          member.balance < this.entryFee
        )
          denialReason = DeniedReason.INSUFFICIENT_BALANCE;
        else if (
          plan.type !== MembershipType.PREPAID &&
          member.expirationDate &&
          new Date(member.expirationDate) < new Date()
        )
          denialReason = DeniedReason.EXPIRED;

        // 2. Handle Denied Access
        if (denialReason) {
          newEntryLog.status = EntryStatus.DENIED;
          newEntryLog.deniedReason = denialReason;
          await manager.save(newEntryLog);
          return false; // Transaction auto-commits the log and returns false
        }

        // 3. Handle Prepaid Deduction
        if (plan.type === MembershipType.PREPAID) {
          // Corrected: Positive value for decrement
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);

          const isAlreadyDeducted = await manager.findOne(EntryLog, {
            where: {
              member: { id: member.id },
              entryTime: Between(startOfDay, endOfDay), // Check any time today
              deductedAmount: this.entryFee,
            },
          });

          if (!isAlreadyDeducted) {
            await manager.decrement(
              Member,
              { id: member.id },
              'balance',
              this.entryFee,
            );

            newEntryLog.deductedAmount = this.entryFee;

            const newTransaction = manager.create(Transaction, {
              member,
              amount: this.entryFee,
              type: TransactionType.DEBIT,
              description: 'Entry Fee',
              runningBalance: member.balance - this.entryFee,
            });
            await manager.save(newTransaction);
          }
        }

        // 4. Grant Access
        newEntryLog.status = EntryStatus.GRANTED;
        await manager.save(newEntryLog);

        return true; // Entire transaction commits automatically here
      })
      .catch((err) => {
        console.error('Access Check Failed:', err);
        return false; // Auto-rolled back by Nest/TypeORM
      });
  }
}
