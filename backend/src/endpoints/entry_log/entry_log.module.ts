import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryLog } from 'src/entities/entry_log.entity';
import { EntryLogController } from './entry_log.controller';
import { EntryLogService } from './entry_log.service';

@Module({
  imports: [TypeOrmModule.forFeature([EntryLog])],
  controllers: [EntryLogController],
  providers: [EntryLogService],
})
export class EntryLogModule {}
