import { TransactionType } from 'src/enums/transaction_types.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Payment } from './payment.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member, (member) => member.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  // Optional: Link to a specific payment if this transaction was triggered by one
  @ManyToOne(() => Payment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column()
  description: string; // e.g., "Monthly Membership Fee", "Wallet Top-up"

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'The member balance immediately after this transaction',
  })
  runningBalance: number;

  @CreateDateColumn()
  createdAt: Date;
}
