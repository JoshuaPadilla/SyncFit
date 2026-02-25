import { Module } from '@nestjs/common';
import { EntryLogService } from './entry_log.service';
import { EntryLogController } from './entry_log.controller';

@Module({
  controllers: [EntryLogController],
  providers: [EntryLogService],
})
export class EntryLogModule {}
