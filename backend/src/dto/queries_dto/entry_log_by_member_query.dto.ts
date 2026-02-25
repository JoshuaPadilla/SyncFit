import { IsUUID } from 'class-validator';
import { EntryLogQueryDto } from './entry_log_query.dto';

export class EntryLogByMemberQueryDto extends EntryLogQueryDto {
  @IsUUID()
  memberId: string;
}
