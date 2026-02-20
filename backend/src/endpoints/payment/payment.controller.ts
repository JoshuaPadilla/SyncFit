import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  createCheckoutSession(@Body() body: { amount: number }) {
    return this.paymentService.createCheckoutSession(body.amount);
  }

  @HttpCode(HttpStatus.OK)
  @Post('user-paid')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('paymongo-signature') signature: string,
  ) {
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET!;
    const payload = req.rawBody!.toString();

    // 1. Signature Verification
    const parts = signature.split(',');
    const timestamp = parts.find((p) => p.startsWith('t='))?.split('=')[1];
    const testSignature = parts.find((p) => p.startsWith('te='))?.split('=')[1];
    const liveSignature = parts.find((p) => p.startsWith('li='))?.split('=')[1];
    const signatureValue = testSignature || liveSignature;

    if (!timestamp || !signatureValue) {
      throw new UnauthorizedException('Missing signature components');
    }

    const baseString = `${timestamp}.${payload}`;
    const checkHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(baseString)
      .digest('hex');

    if (checkHash !== signatureValue) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 2. Safe Data Extraction
    const body = JSON.parse(payload);
    const eventType = body.data?.attributes?.type;

    // Stop here if it's not the event you want
    if (eventType !== 'checkout_session.payment.paid') {
      return { status: 'ignored' };
    }

    const checkoutAttributes = body.data?.attributes?.data?.attributes;
    // Access the first payment in the payments array
    const payment = checkoutAttributes?.payments?.[0];
    const userId = payment?.attributes?.metadata?.userId;
    const amount = (payment?.attributes?.amount || 0) / 100;

    if (!userId) {
      console.log('Payment received but no userId found in metadata.');
      return { status: 'missing_metadata' };
    }

    // 3. Database Logic
    try {
      console.log(`Success: Adding ${amount} to User ${userId}`);
      // await this.userService.addBalance(userId, amount);
      return { status: 'ok' };
    } catch (error) {
      console.error('Database update failed:', error);
      // Returning a 500 here is actually good if the DB is down
      // because PayMongo will retry later.
      throw error;
    }
  }
}
