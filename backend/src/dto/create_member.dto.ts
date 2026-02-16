import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MembershipStatus } from 'src/enums/membership_status.enum';
import { MembershipType } from 'src/enums/membership_type.enum';

export class CreateMemberDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsPhoneNumber('PH') // You can specify region e.g., 'PH'
  phoneNumber?: string;

  @IsNotEmpty()
  @IsString()
  rfidUid: string;

  @IsEnum(MembershipType)
  membershipType: MembershipType;

  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;

  // Optional: If linking to an existing User immediately
  @IsOptional()
  @IsUUID()
  userId?: string;

  // For Prepaid initialization
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance?: number;

  // For Monthly initialization
  @IsOptional()
  @IsDateString()
  expirationDate?: Date;
}
