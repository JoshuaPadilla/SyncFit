import { Module } from '@nestjs/common';
import { DetectionLogsService } from './detection-logs.service';
import { DetectionLogsController } from './detection-logs.controller';

@Module({
  controllers: [DetectionLogsController],
  providers: [DetectionLogsService],
})
export class DetectionLogsModule {}
