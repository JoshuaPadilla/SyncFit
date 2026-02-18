import { UserRole } from 'src/enums/user_role.enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryColumn, // Changed this
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';

@Entity('users')
export class User {
  @PrimaryColumn('uuid') // Supabase provides this UUID
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToOne(() => Member, (member) => member.user)
  member: Member;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
