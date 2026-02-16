import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create_payment.dto';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
