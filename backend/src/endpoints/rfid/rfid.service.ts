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
  private registrationUserId: string | null = null;
  private reassigningUserId: string | null = null;

  private scanTimeout: NodeJS.Timeout | null = null;

  constructor(
    @Inject('MQTT_SERVICE') private client: ClientProxy,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async handleRfidScan(uid: string) {
    // ✅ If we are in registration mode

    if (this.registrationUserId) {
      try {
        await this.saveRfid(uid, this.registrationUserId);
      } catch (err) {
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
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }

      this.registrationUserId = null;

      return { status: 'RFID Registered' };
    }

    if (this.reassigningUserId) {
      try {
        await this.saveRfid(uid, this.reassigningUserId);
      } catch (err) {
        this.client.emit(`rfid/reassignment/${this.reassigningUserId}`, {
          uid: uid,
          status: 'error',
          message: err.message,
        });
        return;
      }

      this.client.emit(`rfid/reassignment/${this.reassigningUserId}`, {
        uid: uid,
        status: 'success',
        message: 'RFID Reassigned Successfully',
      });

      // Clear timeout
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }

      this.reassigningUserId = null;

      return { status: 'RFID Reassigned' };
    }

    const isAllowed = await this.checkAccess(uid);

    if (isAllowed) {
      this.client.emit('door/command', 'unlock');
    } else {
      this.client.emit('door/command', 'denied');
    }
    return;
  }

  async startRegistration(userId: string) {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }

    this.registrationUserId = userId;

    this.scanTimeout = setTimeout(() => {
      this.client.emit(`rfid/registration/${userId}`, {
        uid: null,
        status: 'expired',
        message: 'Registration mode expired',
      });

      this.registrationUserId = null;
      this.scanTimeout = null;

      console.log(`Registration expired for user: ${userId}`);
    }, 30000); // Changed to 30s as per your comment (2000 is only 2 seconds)

    return { status: 'Waiting for RFID tap...' };
  }

  async startReassignment(userId: string) {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }

    this.reassigningUserId = userId;

    this.scanTimeout = setTimeout(() => {
      this.client.emit(`rfid/reassignment/${userId}`, {
        uid: null,
        status: 'expired',
        message: 'Reassignment mode expired',
      });

      this.reassigningUserId = null;
      this.scanTimeout = null;

      console.log(`Reassignment expired for user: ${userId}`);
    }, 30000); // Changed to 30s as per your comment (2000 is only 2 seconds)

    return { status: 'Waiting for RFID tap...' };
  }

  async cancelRegistration() {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
    this.registrationUserId = null;
  }

  async cancelReassignment() {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
    this.reassigningUserId = null;
  }

  async resetRfid(userId: string) {
    const memberRepo = this.dataSource.getRepository(Member);
    const member = await memberRepo.update(
      { user: { id: userId } },
      { rfidUid: null },
    );

    return { status: 'RFID reset functionality not implemented yet' };
  }

  private async saveRfid(uid: string, userId: string) {
    const memberRepo = this.dataSource.getRepository(Member);

    const existingMember = await memberRepo.findOne({
      where: { rfidUid: uid },
      relations: {
        user: true, // This triggers the JOIN
      },
      select: {
        id: true, // Good practice to include the primary key of the main entity
        rfidUid: true,
        user: {
          id: true, // Now this will work
        },
      },
    });

    if (existingMember && existingMember?.user?.id !== userId) {
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
        if (!uid) {
          const newLog = manager.create(EntryLog, {
            rfidUid: uid,
            status: EntryStatus.DENIED,
            deniedReason: DeniedReason.UNKNOWN_CARD,
            createdAt: new Date(),
            entryTime: new Date(),
          });
          const savedEntryLog = await manager.save(newLog);

          this.client.emit('door/newEntry', savedEntryLog);
          console.log('First');
          return false;
        }

        const baseMember = await manager.findOne(Member, {
          where: { rfidUid: uid },
        });

        if (!baseMember) {
          const newLog = manager.create(EntryLog, {
            rfidUid: uid,
            status: EntryStatus.DENIED,
            deniedReason: DeniedReason.UNKNOWN_CARD,
            createdAt: new Date(),
            entryTime: new Date(),
          });
          const savedEntryLog = await manager.save(newLog);
          this.client.emit('door/newEntry', savedEntryLog);
          console.log('Second');
          return false;
        }

        const member = await manager.findOne(Member, {
          where: { id: baseMember.id },
          relations: ['membershipPlan', 'user'],
        });

        if (!member) {
          const newLog = manager.create(EntryLog, {
            rfidUid: uid,
            status: EntryStatus.DENIED,
            deniedReason: DeniedReason.UNKNOWN_CARD,
            createdAt: new Date(),
            entryTime: new Date(),
          });

          const savedEntryLog = await manager.save(newLog);
          this.client.emit('door/newEntry', savedEntryLog);
          console.log('Third');
          return false;
        }

        const newEntryLog = manager.create(EntryLog, {
          rfidUid: uid,
          member,
          entryTime: new Date(),
          createdAt: new Date(),
        });
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
          const savedDeniedLog = await manager.save(newEntryLog);
          this.client.emit('door/newEntry', savedDeniedLog);
          return false;
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
        const savedEntryLog = await manager.save(newEntryLog);
        this.client.emit('door/newEntry', savedEntryLog);
        console.log('last');
        return true; // Entire transaction commits automatically here
      })
      .catch((err) => {
        console.error('Access Check Failed:', err);
        return false; // Auto-rolled back by Nest/TypeORM
      });
  }
}
