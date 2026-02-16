import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeniedReason } from 'src/enums/denied_reason.enum';
import { EntryStatus } from 'src/enums/entry_status.enum';

export class CreateEntryLogDto {
  @IsNotEmpty()
  @IsString()
  rfidUid: string;

  @IsEnum(EntryStatus)
  status: EntryStatus;

  @IsOptional()
  @IsEnum(DeniedReason)
  deniedReason?: DeniedReason;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  deductedAmount?: number;

  // Note: memberId is usually derived from rfidUid in the service logic,
  // but you can include it here if you need to pass it explicitly.
}
