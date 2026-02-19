import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MembershipType } from 'src/enums/membership_type.enum';

export class CreateMembershipPlanDto {
  @IsEnum(MembershipType)
  type: MembershipType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsString()
  title: string;

  @IsString()
  iconName: string;

  @IsString()
  desc: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;
}
