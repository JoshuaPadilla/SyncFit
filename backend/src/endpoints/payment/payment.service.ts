import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { CreateCheckoutDto } from 'src/dto/createCheckoutDto';
import { Member } from 'src/entities/member.entity';
import { MembershipPlan } from 'src/entities/membership_plan.entity';
import { Payment } from 'src/entities/payment.entity';
import { User } from 'src/entities/user.entity';
import { CheckoutType } from 'src/enums/checkout_types.enum';
import { MembershipStatus } from 'src/enums/membership_status.enum';
import { PaymentStatus } from 'src/enums/payment_status.enum';
import { SucessCheckoutMetadata } from 'src/types/success_checkout_metadata';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    private readonly httpService: HttpService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async createPlanCheckout(
    createCheckoutDto: CreateCheckoutDto,
    user: { id: string; email: string },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    const key = process.env.PAYMONGO_KEY || '';

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let successUrl =
        'intent://user_home/#Intent;scheme=SyncFit;package=com.joshua129.syncfit;end';

      const plan = await queryRunner.manager.findOne(MembershipPlan, {
        where: { id: createCheckoutDto.membershipPlanId },
      });

      if (!plan) {
        throw new Error();
      }
      const url = 'https://api.paymongo.com/v1/checkout_sessions';

      const options = {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          // Encode your Secret Key in Base64 for Basic Auth
          authorization: `Basic ${Buffer.from(key).toString('base64')}`,
        },
      };

      const data = {
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            payment_method_types: ['gcash'],
            metadata: {
              userId: user.id,
              planId: plan.id,
              type: CheckoutType.MEMBERSHIP_PLAN,
            },
            line_items: [
              {
                currency: 'PHP',
                amount: Math.round(Number(plan.price) * 100),
                name: 'Syncfit Payment',
                quantity: 1,
              },
            ],
            success_url: successUrl,
            failed_url: 'myapp://payment-failed',
            description: 'Syncfit Membership Plan Payment',
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(url, data, options),
      );

      return { url: response.data.data.attributes.checkout_url };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();

      throw new BadRequestException('Something went wrong');
    } finally {
      await queryRunner.release();
    }
  }

  async sucessPlanCheckout(metadata: SucessCheckoutMetadata) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: metadata.userId },
        relations: ['member'],
      });

      const plan = await queryRunner.manager.findOne(MembershipPlan, {
        where: { id: metadata.planId },
      });

      if (!user || !plan) throw new Error('User or Plan not found');

      let member = user.member;
      const now = new Date();

      if (!member) {
        // Create new member record
        member = queryRunner.manager.create(Member, {
          user: user, // Link the user object
          dateActivated: now,
        });
      }

      // Logic: If they have an active plan, add to expiry. Otherwise, start from now.
      // Use .getTime() to safely compare dates
      const currentExpiryDate =
        member.expirationDate &&
        new Date(member.expirationDate).getTime() > now.getTime()
          ? new Date(member.expirationDate)
          : now;

      const newExpiry = new Date(currentExpiryDate);
      newExpiry.setDate(newExpiry.getDate() + plan.durationDays);

      member.lastRenewalDate = now;
      member.expirationDate = newExpiry;
      member.membershipPlan = plan;
      member.status = MembershipStatus.ACTIVE;

      // 1. Save Member
      const savedMember = await queryRunner.manager.save(Member, member);

      // 2. Create Payment using the savedMember
      const newPayment = queryRunner.manager.create(Payment, {
        member: savedMember,
        amount: metadata.amount,
        paymentMethod: metadata.paymentMethod,
        paymongoReference: metadata.paymongoReference,
        status: PaymentStatus.PAID,
        rawWebhookData: metadata.rawWebhookData,
      });

      // 3. Save Payment
      await queryRunner.manager.save(Payment, newPayment);

      await queryRunner.commitTransaction();

      return { success: true, expiry: newExpiry };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // Rethrow or handle error so the caller knows it failed
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async successTopUpCheckout(metadata: SucessCheckoutMetadata) {
    console.log(metadata);
  }
}
