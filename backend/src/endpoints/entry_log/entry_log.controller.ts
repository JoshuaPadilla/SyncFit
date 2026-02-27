import { Controller, Get, Query, Request } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { EntryLogByMemberQueryDto } from 'src/dto/queries_dto/entry_log_by_member_query.dto';
import { EntryLogQueryDto } from 'src/dto/queries_dto/entry_log_query.dto';
import { UserRole } from 'src/enums/user_role.enums';
import { EntryLogService } from './entry_log.service';

// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('entry-log')
export class EntryLogController {
  constructor(private readonly entryLogService: EntryLogService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  async fetchAll(@Query() query: EntryLogQueryDto, @Request() req) {
    return this.entryLogService.fetchAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('by-member')
  async getEntryLogsByMember(@Query() query: EntryLogByMemberQueryDto) {
    return this.entryLogService.getEntryLogsByMember(query);
  }

  @Get('insights')
  async getInsights() {
    return this.entryLogService.getInsights();
  }
}
