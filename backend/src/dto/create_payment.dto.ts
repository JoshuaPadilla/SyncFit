import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PaymentStatus } from 'src/enums/payment_status.enum';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  memberId: string;

  @IsNotEmpty()
  @IsString()
  paymongoReference: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string; // e.g., 'gcash', 'grab_pay'

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsObject()
  rawWebhookData?: any;
}
