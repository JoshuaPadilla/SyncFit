import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectionLog } from '../../entities/detection_log.entity';
import { DetectionLogsController } from './detection-logs.controller';
import { DetectionLogsService } from './detection-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([DetectionLog])],
  controllers: [DetectionLogsController],
  providers: [DetectionLogsService],
})
export class DetectionLogsModule {}
