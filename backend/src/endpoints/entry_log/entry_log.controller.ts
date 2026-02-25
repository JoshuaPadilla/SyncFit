import { Controller } from '@nestjs/common';
import { EntryLogService } from './entry_log.service';

@Controller('entry-log')
export class EntryLogController {
  constructor(private readonly entryLogService: EntryLogService) {}
}
