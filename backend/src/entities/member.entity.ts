import { MembershipStatus } from 'src/enums/membership_status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntryLog } from './entry_log.entity';
import { MembershipPlan } from './membership_plan.entity';
import { Payment } from './payment.entity';
import { User } from './user.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Index()
  @Column({ unique: true, nullable: true })
  rfidUid: string;

  @ManyToOne(() => MembershipPlan, (plan) => plan.members, {
    nullable: true, // Set to false if every member MUST have a plan
    onDelete: 'SET NULL',
  })
  membershipPlan: MembershipPlan;

  @Index()
  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  // For prepaid
  @Column({
    default: 0,
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  balance: number;

  @OneToMany(() => EntryLog, (log) => log.member)
  entryLogs: EntryLog[];

  @OneToMany(() => Payment, (payment) => payment.member)
  payments: Payment[];

  @Column({ type: 'timestamp', nullable: true })
  dateActivated: Date; // The FIRST time they ever joined

  @Column({ type: 'timestamp', nullable: true })
  lastRenewalDate: Date; // The most recent time they paid

  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date; // current date + plan duration

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
