import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentStatus } from 'src/enums/payment_status.enum';
import { BaseQueryDto } from './base_query.dto';

export class PaymentQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsUUID()
  memberId?: string;
}
