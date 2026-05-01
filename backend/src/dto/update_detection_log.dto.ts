import { PartialType } from '@nestjs/mapped-types';
import { CreateDetectionLogDto } from './create_detection_log.dto';

export class UpdateDetectionLogDto extends PartialType(CreateDetectionLogDto) {}
