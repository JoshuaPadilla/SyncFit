import { MembershipType } from 'src/enums/membership_type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('membership_plans')
export class MembershipPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  desc: string;

  @Column()
  title: string;

  @Column()
  iconName: string;

  @Index()
  @Column({
    type: 'enum',
    enum: MembershipType,
  })
  type: MembershipType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // Used for monthly
  @Column({ type: 'int', nullable: true })
  durationDays: number;

  @CreateDateColumn()
  createdAt: Date;
}
