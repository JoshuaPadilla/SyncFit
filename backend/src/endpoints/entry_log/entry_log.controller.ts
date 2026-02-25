import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EntryLogByMemberQueryDto } from 'src/dto/queries_dto/entry_log_by_member_query.dto';
import { EntryLogQueryDto } from 'src/dto/queries_dto/entry_log_query.dto';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { EntryLogService } from './entry_log.service';

@Controller('entry-log')
export class EntryLogController {
  constructor(private readonly entryLogService: EntryLogService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async fetchAll(@Query() query: EntryLogQueryDto) {
    return this.entryLogService.fetchAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-member')
  async getEntryLogsByMember(@Query() query: EntryLogByMemberQueryDto) {
    return this.entryLogService.getEntryLogsByMember(query);
  }
}
