import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import supabaseConfig from './config/supabase.config';
import { EntryLogModule } from './endpoints/entry_log/entry_log.module';
import { MembershipPlanModule } from './endpoints/membership_plan/membership_plan.module';
import { PaymentModule } from './endpoints/payment/payment.module';
import { RfidModule } from './endpoints/rfid/rfid.module';
import { UserModule } from './endpoints/user/user.module';
import { EntryLog } from './entities/entry_log.entity';
import { Member } from './entities/member.entity';
import { MembershipPlan } from './entities/membership_plan.entity';
import { Payment } from './entities/payment.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from './entities/user.entity';
import { DetectionLogsModule } from './modules/detection-logs/detection-logs.module';
import { SupabaseModule } from './modules/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [User, EntryLog, Member, MembershipPlan, Payment, Transaction],
    }),

    UserModule,
    MembershipPlanModule,
    RfidModule,
    PaymentModule,
    EntryLogModule,
    SupabaseModule,
    DetectionLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
