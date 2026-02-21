import { IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  membershipPlanId: string;
}
