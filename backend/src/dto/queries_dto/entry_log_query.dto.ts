import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { EntryStatus } from 'src/enums/entry_status.enum';
import { BaseQueryDto } from './base_query.dto';

export class EntryLogQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(EntryStatus)
  status?: EntryStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
