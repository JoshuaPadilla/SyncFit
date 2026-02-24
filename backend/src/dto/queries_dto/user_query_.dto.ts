import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { MembershipStatus } from 'src/enums/membership_status.enum';
import { MembershipType } from 'src/enums/membership_type.enum';
import { BaseQueryDto } from './base_query.dto';
export class UserQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;

  @IsOptional()
  @IsEnum(MembershipType)
  membershipType?: MembershipType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isExpired?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minBalance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxBalance?: number;
}
