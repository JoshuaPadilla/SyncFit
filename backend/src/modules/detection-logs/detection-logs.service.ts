import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { extname } from 'node:path';
import { CreateDetectionLogDto } from '../../dto/create_detection_log.dto';
import { SupabaseService } from '../supabase.service';

const DETECTION_LOGS_BUCKET = 'snail-detected';
const MAX_DETECTION_LOG_FILE_SIZE_BYTES = 2 * 1024 * 1024;

@Injectable()
export class DetectionLogsService {
  private readonly logger = new Logger(DetectionLogsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async createDetectionLog(
    photo: {
      buffer: Buffer;
      mimetype: string;
      originalname?: string;
      size: number;
    },
    createDetectionLogDto: CreateDetectionLogDto,
  ) {
    this.ensurePhotoIsValid(photo);

    const metadataDocument = this.buildMetadataDocument(
      createDetectionLogDto,
      photo,
    );
    const objectBasePath = this.buildObjectBasePath(createDetectionLogDto);
    const photoPath = `${objectBasePath}.${this.resolveFileExtension(photo)}`;
    const metadataPath = `${objectBasePath}.json`;
    const storage = this.supabaseService.client.storage.from(
      DETECTION_LOGS_BUCKET,
    );

    const photoUpload = await storage.upload(photoPath, photo.buffer, {
      contentType: photo.mimetype,
      upsert: false,
    });

    if (photoUpload.error) {
      this.logger.error(
        `Failed to upload detection photo for event ${createDetectionLogDto.eventId}: ${photoUpload.error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to upload detection photo',
      );
    }

    const metadataUpload = await storage.upload(
      metadataPath,
      Buffer.from(JSON.stringify(metadataDocument, null, 2), 'utf8'),
      {
        contentType: 'application/json',
        upsert: false,
      },
    );

    if (metadataUpload.error) {
      this.logger.error(
        `Failed to upload detection metadata for event ${createDetectionLogDto.eventId}: ${metadataUpload.error.message}`,
      );
      await storage.remove([photoPath]).catch(() => undefined);
      throw new InternalServerErrorException(
        'Failed to upload detection metadata',
      );
    }

    return {
      ok: true,
      bucket: DETECTION_LOGS_BUCKET,
      eventId: createDetectionLogDto.eventId,
      photoPath,
      metadataPath,
    };
  }

  private ensurePhotoIsValid(photo: {
    buffer: Buffer;
    mimetype: string;
    originalname?: string;
    size: number;
  }) {
    if (!photo?.buffer?.length) {
      throw new BadRequestException('photo is required');
    }

    if (
      (photo.size ?? photo.buffer.length) > MAX_DETECTION_LOG_FILE_SIZE_BYTES
    ) {
      throw new BadRequestException('photo must be 2 MB or smaller');
    }

    if (!photo.mimetype?.startsWith('image/')) {
      throw new BadRequestException('photo must be an image');
    }
  }

  private buildMetadataDocument(
    createDetectionLogDto: CreateDetectionLogDto,
    photo: {
      buffer: Buffer;
      mimetype: string;
      originalname?: string;
      size: number;
    },
  ) {
    let parsedMetadata: unknown;

    try {
      parsedMetadata = JSON.parse(createDetectionLogDto.metadata);
    } catch {
      throw new BadRequestException('metadata must be valid JSON');
    }

    const metadataRoot: Record<string, unknown> = this.isRecord(parsedMetadata)
      ? { ...parsedMetadata }
      : { payload: parsedMetadata };
    const nestedMetadata = this.isRecord(metadataRoot.metadata)
      ? metadataRoot.metadata
      : {};

    return {
      ...metadataRoot,
      eventId: createDetectionLogDto.eventId,
      capturedAt: createDetectionLogDto.capturedAt,
      eggClusterCount: createDetectionLogDto.eggClusterCount,
      metadata: {
        ...nestedMetadata,
        platform: createDetectionLogDto.platform,
      },
      upload: {
        originalFileName: photo.originalname ?? null,
        mimeType: photo.mimetype,
        size: photo.size,
      },
    };
  }

  private buildObjectBasePath(createDetectionLogDto: CreateDetectionLogDto) {
    const capturedAt = new Date(createDetectionLogDto.capturedAt).toISOString();
    const [datePart] = capturedAt.split('T');
    const [year, month, day] = datePart.split('-');
    const safeEventId = this.sanitizePathSegment(createDetectionLogDto.eventId);
    const safeTimestamp = capturedAt.replace(/[:.]/g, '-');

    return `${year}/${month}/${day}/${safeEventId}-${safeTimestamp}`;
  }

  private resolveFileExtension(photo: {
    buffer: Buffer;
    mimetype: string;
    originalname?: string;
    size: number;
  }) {
    const originalExtension = extname(photo.originalname ?? '').toLowerCase();

    if (originalExtension) {
      return originalExtension.replace(/^\./, '');
    }

    switch (photo.mimetype) {
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return 'jpg';
    }
  }

  private sanitizePathSegment(value: string) {
    return value.replace(/[^a-zA-Z0-9._-]/g, '-');
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
