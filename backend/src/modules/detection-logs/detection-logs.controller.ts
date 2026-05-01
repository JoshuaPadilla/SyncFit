import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDetectionLogDto } from '../../dto/create_detection_log.dto';
import { DetectionLogsService } from './detection-logs.service';

const MAX_DETECTION_LOG_FILE_SIZE_BYTES = 2 * 1024 * 1024;

@Controller('detection-logs')
export class DetectionLogsController {
  constructor(private readonly detectionLogsService: DetectionLogsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        fileSize: MAX_DETECTION_LOG_FILE_SIZE_BYTES,
      },
    }),
  )
  async createDetectionLog(
    @UploadedFile()
    photo: {
      buffer: Buffer;
      mimetype: string;
      originalname?: string;
      size: number;
    },
    @Body() createDetectionLogDto: CreateDetectionLogDto,
  ) {
    return this.detectionLogsService.createDetectionLog(
      photo,
      createDetectionLogDto,
    );
  }
}
