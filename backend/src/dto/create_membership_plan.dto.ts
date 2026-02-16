import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MembershipType } from 'src/enums/membership_type.enum';

export class CreateMembershipPlanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(MembershipType)
  type: MembershipType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sessionPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;
}
