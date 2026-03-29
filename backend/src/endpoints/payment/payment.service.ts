import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { CreateCheckoutDto } from 'src/dto/createCheckoutDto';
import { CreateTopupDto } from 'src/dto/createTopupDto';
import { PaymentQueryDto } from 'src/dto/queries_dto/payment_query.dto';
import { Member } from 'src/entities/member.entity';
import { MembershipPlan } from 'src/entities/membership_plan.entity';
import { Payment } from 'src/entities/payment.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { CheckoutType } from 'src/enums/checkout_types.enum';
import { MembershipStatus } from 'src/enums/membership_status.enum';
import { MembershipType } from 'src/enums/membership_type.enum';
import { PaymentStatus } from 'src/enums/payment_status.enum';
import { TransactionType } from 'src/enums/transaction_types.enum';
import { SucessCheckoutMetadata } from 'src/types/success_checkout_metadata';
import { Brackets, DataSource } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    private readonly httpService: HttpService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private createPaymentQueryBuilder(query: PaymentQueryDto) {
    const qb = this.dataSource
      .getRepository(Payment)
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.member', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.membershipPlan', 'membershipPlan');

    if (query.memberId) {
      qb.andWhere('member.id = :memberId', { memberId: query.memberId });
    }

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    if (query.paymentMethod) {
      qb.andWhere('LOWER(payment.paymentMethod) = :paymentMethod', {
        paymentMethod: query.paymentMethod.toLowerCase(),
      });
    }

    if (query.search) {
      const search = `%${query.search.toLowerCase()}%`;

      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery
            .where('LOWER(user.firstName) LIKE :search', { search })
            .orWhere('LOWER(user.lastName) LIKE :search', { search })
            .orWhere('LOWER(user.email) LIKE :search', { search })
            .orWhere('LOWER(payment.paymongoReference) LIKE :search', {
              search,
            })
            .orWhere('LOWER(payment.paymentMethod) LIKE :search', { search })
            .orWhere('LOWER(membershipPlan.title) LIKE :search', { search });
        }),
      );
    }

    return qb;
  }

  async fetchPayments(query: PaymentQueryDto) {
    const { page = 1, limit = 10 } = query;

    const qb = this.createPaymentQueryBuilder(query)
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPaymentSummary(query: PaymentQueryDto) {
    const aggregate = await this.createPaymentQueryBuilder(query)
      .select('COUNT(payment.id)', 'totalPayments')
      .addSelect(
        'COALESCE(SUM(CASE WHEN payment.status = :paidStatus THEN payment.amount ELSE 0 END), 0)',
        'totalRevenue',
      )
      .setParameter('paidStatus', PaymentStatus.PAID)
      .getRawOne<{ totalPayments: string; totalRevenue: string }>();

    const groupedStatuses = await this.createPaymentQueryBuilder(query)
      .select('payment.status', 'status')
      .addSelect('COUNT(payment.id)', 'count')
      .groupBy('payment.status')
      .getRawMany<{ status: PaymentStatus; count: string }>();

    const groupedMethods = await this.createPaymentQueryBuilder(query)
      .select('LOWER(payment.paymentMethod)', 'paymentMethod')
      .addSelect('COUNT(payment.id)', 'count')
      .groupBy('LOWER(payment.paymentMethod)')
      .orderBy('count', 'DESC')
      .getRawMany<{ paymentMethod: string | null; count: string }>();

    const statusCounts: Record<PaymentStatus, number> = {
      [PaymentStatus.PENDING]: 0,
      [PaymentStatus.PAID]: 0,
      [PaymentStatus.FAILED]: 0,
    };

    for (const entry of groupedStatuses) {
      statusCounts[entry.status] = Number(entry.count);
    }

    return {
      totalPayments: Number(aggregate?.totalPayments ?? 0),
      totalRevenue: Number(aggregate?.totalRevenue ?? 0),
      statusCounts,
      paymentMethods: groupedMethods
        .filter((entry) => entry.paymentMethod)
        .map((entry) => ({
          paymentMethod: entry.paymentMethod as string,
          count: Number(entry.count),
        })),
    };
  }

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
        'intent://success_payment/#Intent;scheme=syncfit;package=com.joshua129.syncfit;end';

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
            failed_url:
              'intent://failed_payment/#Intent;scheme=SyncFit;package=com.joshua129.syncfit;end',
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

  async createTopupCheckout(
    createTopupDto: CreateTopupDto,
    user: { id: string; email: string },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    const key = process.env.PAYMONGO_KEY || '';

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let successUrl =
        'intent://success_payment/#Intent;scheme=syncfit;package=com.joshua129.syncfit;end';

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
              type: CheckoutType.TOP_UP,
            },
            line_items: [
              {
                currency: 'PHP',
                amount: Math.round(createTopupDto.amount * 100),
                name: 'Syncfit Payment',
                quantity: 1,
              },
            ],
            success_url: successUrl,
            failed_url:
              'intent://failed_payment/#Intent;scheme=SyncFit;package=com.joshua129.syncfit;end',
            cancel_url:
              'intent://failed_payment/#Intent;scheme=SyncFit;package=com.joshua129.syncfit;end', // Add this
            description: 'Syncfit Topup Payment',
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

      // 1. Initialize or Update Member
      if (!member) {
        member = queryRunner.manager.create(Member, {
          user: user,
          dateActivated: now,
          balance: 0, // Ensure balance starts at 0
        });
      }

      if (plan.type === MembershipType.PREPAID) {
        member.balance = Number(member.balance) + Number(plan.price);
        member.membershipPlan = plan;
        member.status = MembershipStatus.ACTIVE;
      } else {
        // 2. Calculate Expiry Logic
        const currentExpiryDate =
          member.expirationDate && new Date(member.expirationDate) > now
            ? new Date(member.expirationDate)
            : now;

        const newExpiry = new Date(currentExpiryDate);
        newExpiry.setDate(newExpiry.getDate() + plan.durationDays);

        member.lastRenewalDate = now;
        member.expirationDate = newExpiry;
        member.membershipPlan = plan;
        member.status = MembershipStatus.ACTIVE;
      }

      // Logic for running balance (assuming payment adds to balance or it's just a record)
      // If this is a direct plan purchase, balance might stay same or increase then decrease.
      // For now, let's assume we update the member and get the ID.
      const savedMember = await queryRunner.manager.save(Member, member);

      // 3. Create Payment
      const newPayment = queryRunner.manager.create(Payment, {
        member: savedMember,
        amount: metadata.amount,
        paymentMethod: metadata.paymentMethod,
        paymongoReference: metadata.paymongoReference,
        status: PaymentStatus.PAID,
        rawWebhookData: metadata.rawWebhookData,
      });
      const savedPayment = await queryRunner.manager.save(Payment, newPayment);

      // 4. Create Transaction Record
      const newTransaction = queryRunner.manager.create(Transaction, {
        amount: metadata.amount,
        type: TransactionType.CREDIT,
        description: `Payment for ${plan.type} plan`,
        member: savedMember,
        payment: savedPayment,
        runningBalance: Number(savedMember.balance),
      });
      await queryRunner.manager.save(Transaction, newTransaction);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async successTopUpCheckout(metadata: SucessCheckoutMetadata) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: metadata.userId },
        relations: ['member'], // Just need the member link here
      });

      if (!user || !user?.member) throw new Error('User or Plan not found');

      let member = user.member;

      await queryRunner.manager.increment(
        Member,
        { id: member.id },
        'balance',
        metadata.amount,
      );

      // 3. Create Payment
      const newPayment = queryRunner.manager.create(Payment, {
        member: member,
        amount: metadata.amount,
        paymentMethod: metadata.paymentMethod,
        paymongoReference: metadata.paymongoReference,
        status: PaymentStatus.PAID,
        rawWebhookData: metadata.rawWebhookData,
      });
      const savedPayment = await queryRunner.manager.save(Payment, newPayment);

      // 4. Create Transaction Record
      const newTransaction = queryRunner.manager.create(Transaction, {
        amount: metadata.amount,
        type: TransactionType.CREDIT,
        description: `Top-up payment`,
        member: member,
        payment: savedPayment,
        runningBalance: Number(member.balance),
      });
      await queryRunner.manager.save(Transaction, newTransaction);

      await queryRunner.commitTransaction();

      return { success: true, newBalance: member.balance };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
