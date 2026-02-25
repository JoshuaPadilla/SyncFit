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
import { DataSource } from 'typeorm';

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
      await this.saveRfid(uid, this.registrationUserId);
      this.client.emit(`rfid/registration/${this.registrationUserId}`, {
        uid: uid,
        status: 'registered',
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
    // Cancel existing registration if any
    if (this.registrationTimeout) {
      clearTimeout(this.registrationTimeout);
    }

    this.registrationMode = true;
    this.registrationUserId = userId;

    // Set 30s timeout
    this.registrationTimeout = setTimeout(() => {
      this.registrationUserId = null;
      this.registrationTimeout = null;
      console.log('Registration mode expired');
    }, 30000);

    return { status: 'Waiting for RFID tap...' };
  }

  private async saveRfid(uid: string, userId: string) {
    const memberRepo = this.dataSource.getRepository(Member);
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
          member.expirationDate &&
          new Date(member.expirationDate) < new Date()
        )
          denialReason = DeniedReason.EXPIRED;
        else if (
          plan.type === MembershipType.PREPAID &&
          member.balance < this.entryFee
        )
          denialReason = DeniedReason.INSUFFICIENT_BALANCE;

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
          await manager.decrement(
            Member,
            { id: member.id },
            'balance',
            this.entryFee,
          );

          const newTransaction = manager.create(Transaction, {
            member,
            amount: this.entryFee,
            type: TransactionType.DEBIT,
            description: 'Entry Fee',
            runningBalance: member.balance - this.entryFee,
          });
          await manager.save(newTransaction);
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
