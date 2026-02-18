import { MembershipStatus } from 'src/enums/membership_status.enum';
import { MembershipType } from 'src/enums/membership_type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntryLog } from './entry_log.entity';
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
  @Column({ unique: true })
  rfidUid: string;

  @Column({
    type: 'enum',
    enum: MembershipType,
  })
  membershipType: MembershipType;

  @Index()
  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  // For prepaid
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  balance: number;

  // For monthly
  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date;

  @OneToMany(() => EntryLog, (log) => log.member)
  entryLogs: EntryLog[];

  @OneToMany(() => Payment, (payment) => payment.member)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
