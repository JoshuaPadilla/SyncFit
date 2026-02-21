import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  RawBodyRequest,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateCheckoutDto } from 'src/dto/createCheckoutDto';
import { CheckoutType } from 'src/enums/checkout_types.enum';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { SucessCheckoutMetadata } from 'src/types/success_checkout_metadata';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('plan-checkout')
  createCheckoutSession(
    @Request() req,
    @Body() createcheckoutDto: CreateCheckoutDto,
  ) {
    return this.paymentService.createPlanCheckout(createcheckoutDto, req.user);
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
    const planId = payment?.attributes?.metadata?.planId;
    const paymongoReference = payment?.id;
    const paymentMethod = checkoutAttributes?.payment_method_used;
    const type = payment?.attributes?.metadata?.type;

    const metadata = {
      amount,
      planId,
      userId,
      paymongoReference,
      paymentMethod,
      rawWebhookData: body,
    } as SucessCheckoutMetadata;

    if (!userId || !type) {
      console.log('Payment received but no userId found in metadata.');
      throw new NotFoundException('missing metadata');
    }

    switch (type) {
      case CheckoutType.MEMBERSHIP_PLAN:
        await this.paymentService.sucessPlanCheckout(metadata);
        break;

      case CheckoutType.TOP_UP:
        await this.paymentService.successTopUpCheckout(metadata);
        break;

      default:
        throw new NotFoundException('missing event type');
    }
  }
}
