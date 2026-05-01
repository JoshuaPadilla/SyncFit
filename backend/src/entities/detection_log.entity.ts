import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('detection_logs')
export class DetectionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  eventId: string;

  @Column({ type: 'timestamptz' })
  capturedAt: Date;

  @Column({ type: 'int' })
  eggClusterCount: number;

  @Column()
  platform: string;

  @Column({ type: 'jsonb' })
  metadata: Record<string, unknown>;

  @Column({ default: 'snail-detected' })
  bucket: string;

  @Column()
  photoPath: string;

  @Column({ type: 'text', nullable: true })
  photoOriginalName: string | null;

  @Column()
  photoMimeType: string;

  @Column({ type: 'int' })
  photoSize: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
