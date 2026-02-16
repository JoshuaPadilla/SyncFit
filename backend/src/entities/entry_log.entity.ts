import { DeniedReason } from 'src/enums/denied_reason.enum';
import { EntryStatus } from 'src/enums/entry_status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Member } from './member.entity';

@Entity('entry_logs')
export class EntryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member, (member) => member.entryLogs, { nullable: true })
  member: Member;

  @Column()
  rfidUid: string;

  @Column({
    type: 'enum',
    enum: EntryStatus,
  })
  status: EntryStatus;

  @Column({
    type: 'enum',
    enum: DeniedReason,
    nullable: true,
  })
  deniedReason: DeniedReason;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deductedAmount: number;

  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  entryTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}
