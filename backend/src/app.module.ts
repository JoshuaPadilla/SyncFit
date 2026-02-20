import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembershipPlanModule } from './endpoints/membership_plan/membership_plan.module';
import { PaymentModule } from './endpoints/payment/payment.module';
import { RfidModule } from './endpoints/rfid/rfid.module';
import { UserModule } from './endpoints/user/user.module';
import { EntryLog } from './entities/entry_log.entity';
import { Member } from './entities/member.entity';
import { MembershipPlan } from './entities/member_plan.entity';
import { Payment } from './entities/payment.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [User, EntryLog, Member, MembershipPlan, Payment],
    }),

    UserModule,
    MembershipPlanModule,
    RfidModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
