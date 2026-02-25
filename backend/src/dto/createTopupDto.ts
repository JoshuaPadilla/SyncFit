import { IsNumber } from 'class-validator';

export class CreateTopupDto {
  @IsNumber()
  amount: number;
}
