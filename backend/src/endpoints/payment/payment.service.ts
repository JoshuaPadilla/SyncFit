import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
  constructor(private readonly httpService: HttpService) {}

  async createCheckoutSession(amount: number) {
    const key = process.env.PAYMONGO_KEY || '';

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
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          payment_method_types: ['gcash'],
          line_items: [
            {
              currency: 'PHP',
              amount: amount * 100, // PayMongo uses centavos (1000 = 10.00 PHP)
              name: 'School Project Fee',
              quantity: 1,
            },
          ],
          success_url:
            'intent://login/#Intent;scheme=SyncFit;package=com.joshua129.syncfit;end',
          failed_url: 'myapp://payment-failed',
          description: 'Gym Load Top-up',
        },
      },
    };

    const response = await firstValueFrom(
      this.httpService.post(url, data, options),
    );
    return { url: response.data.data.attributes.checkout_url };
  }
}
