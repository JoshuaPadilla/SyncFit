import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'node:path';
import { Repository } from 'typeorm';
import { CreateDetectionLogDto } from '../../dto/create_detection_log.dto';
import { UpdateDetectionLogDto } from '../../dto/update_detection_log.dto';
import { DetectionLog } from '../../entities/detection_log.entity';
import { SupabaseService } from '../supabase.service';

const DETECTION_LOGS_BUCKET = 'snail-detected';
const MAX_DETECTION_LOG_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const PHOTO_URL_TTL_SECONDS = 60 * 60;

type DetectionLogPhoto = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size: number;
};

@Injectable()
export class DetectionLogsService {
  private readonly logger = new Logger(DetectionLogsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRepository(DetectionLog)
    private readonly detectionLogsRepo: Repository<DetectionLog>,
  ) {}

  async createDetectionLog(
    photo: DetectionLogPhoto,
    createDetectionLogDto: CreateDetectionLogDto,
  ) {
    await this.ensureEventIdIsAvailable(createDetectionLogDto.eventId);
    this.ensurePhotoIsValid(photo);

    const capturedAt = this.parseCapturedAt(createDetectionLogDto.capturedAt);
    const normalizedMetadata = this.normalizeMetadataValue(
      this.parseMetadataPayload(createDetectionLogDto.metadata),
      createDetectionLogDto.platform,
    );
    const objectBasePath = this.buildObjectBasePath(createDetectionLogDto);
    const photoPath = `${objectBasePath}.${this.resolveFileExtension(photo)}`;
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

    let detectionLog = this.detectionLogsRepo.create({
      eventId: createDetectionLogDto.eventId,
      capturedAt,
      eggClusterCount: createDetectionLogDto.eggClusterCount,
      platform: createDetectionLogDto.platform,
      metadata: normalizedMetadata,
      bucket: DETECTION_LOGS_BUCKET,
      photoPath,
      photoOriginalName: photo.originalname ?? null,
      photoMimeType: photo.mimetype,
      photoSize: photo.size,
    });

    try {
      detectionLog = await this.detectionLogsRepo.save(detectionLog);
    } catch (error) {
      await storage.remove([photoPath]).catch(() => undefined);
      this.logger.error(
        `Failed to persist detection log ${createDetectionLogDto.eventId}: ${this.stringifyError(error)}`,
      );
      throw new InternalServerErrorException('Failed to persist detection log');
    }

    return this.mapDetectionLogToResponse(detectionLog);
  }

  async findAllDetectionLogs() {
    const detectionLogs = await this.detectionLogsRepo.find({
      order: {
        capturedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
    const photoUrlMap = await this.createSignedUrlMap(
      detectionLogs.map((detectionLog) => detectionLog.photoPath),
    );

    return detectionLogs.map((detectionLog) =>
      this.mapDetectionLogToResponse(
        detectionLog,
        photoUrlMap.get(detectionLog.photoPath) ?? null,
      ),
    );
  }

  async findOneDetectionLog(eventId: string) {
    const detectionLog = await this.getDetectionLogByEventId(eventId);
    const photoUrl = await this.createSignedPhotoUrl(detectionLog.photoPath);

    return this.mapDetectionLogToResponse(detectionLog, photoUrl);
  }

  async updateDetectionLog(
    eventId: string,
    updateDetectionLogDto: UpdateDetectionLogDto,
  ) {
    const detectionLog = await this.getDetectionLogByEventId(eventId);

    if (
      updateDetectionLogDto.eventId &&
      updateDetectionLogDto.eventId !== detectionLog.eventId
    ) {
      throw new BadRequestException('eventId cannot be changed');
    }

    const nextPlatform =
      updateDetectionLogDto.platform ?? detectionLog.platform;

    if (updateDetectionLogDto.capturedAt) {
      detectionLog.capturedAt = this.parseCapturedAt(
        updateDetectionLogDto.capturedAt,
      );
    }

    if (updateDetectionLogDto.eggClusterCount !== undefined) {
      detectionLog.eggClusterCount = updateDetectionLogDto.eggClusterCount;
    }

    detectionLog.platform = nextPlatform;

    if (updateDetectionLogDto.metadata !== undefined) {
      detectionLog.metadata = this.normalizeMetadataValue(
        this.parseMetadataPayload(updateDetectionLogDto.metadata),
        nextPlatform,
      );
    } else if (updateDetectionLogDto.platform !== undefined) {
      detectionLog.metadata = this.normalizeMetadataValue(
        detectionLog.metadata,
        nextPlatform,
      );
    }

    const savedDetectionLog = await this.detectionLogsRepo.save(detectionLog);
    const photoUrl = await this.createSignedPhotoUrl(
      savedDetectionLog.photoPath,
    );

    return this.mapDetectionLogToResponse(savedDetectionLog, photoUrl);
  }

  async deleteDetectionLog(eventId: string) {
    const detectionLog = await this.getDetectionLogByEventId(eventId);
    const storage = this.supabaseService.client.storage.from(
      DETECTION_LOGS_BUCKET,
    );
    const { error } = await storage.remove([detectionLog.photoPath]);

    if (error) {
      this.logger.error(
        `Failed to delete storage artifacts for event ${eventId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to delete detection log files',
      );
    }

    await this.detectionLogsRepo.softDelete(detectionLog.id);

    return {
      message: 'Detection log deleted successfully',
    };
  }

  private ensurePhotoIsValid(photo: DetectionLogPhoto) {
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

  private async createSignedUrlMap(photoPaths: string[]) {
    if (photoPaths.length === 0) {
      return new Map<string, string>();
    }

    const { data, error } = await this.supabaseService.client.storage
      .from(DETECTION_LOGS_BUCKET)
      .createSignedUrls(photoPaths, PHOTO_URL_TTL_SECONDS);

    if (error) {
      this.logger.error(
        `Failed to create signed detection photo URLs: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to create detection photo URLs',
      );
    }

    return new Map(
      data.flatMap((item) =>
        item.path && item.signedUrl
          ? [[item.path, item.signedUrl] as const]
          : [],
      ),
    );
  }

  private async createSignedPhotoUrl(photoPath: string) {
    const { data, error } = await this.supabaseService.client.storage
      .from(DETECTION_LOGS_BUCKET)
      .createSignedUrl(photoPath, PHOTO_URL_TTL_SECONDS);

    if (error) {
      this.logger.error(
        `Failed to create signed photo URL for ${photoPath}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to create detection photo URL',
      );
    }

    return data.signedUrl;
  }

  private buildObjectBasePath(createDetectionLogDto: CreateDetectionLogDto) {
    const capturedAt = this.parseCapturedAt(
      createDetectionLogDto.capturedAt,
    ).toISOString();
    const [datePart] = capturedAt.split('T');
    const [year, month, day] = datePart.split('-');
    const safeEventId = this.sanitizePathSegment(createDetectionLogDto.eventId);
    const safeTimestamp = capturedAt.replace(/[:.]/g, '-');

    return `${year}/${month}/${day}/${safeEventId}-${safeTimestamp}`;
  }

  private resolveFileExtension(photo: DetectionLogPhoto) {
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

  private parseCapturedAt(capturedAt: string) {
    const parsedDate = new Date(capturedAt);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('capturedAt must be a valid ISO date');
    }

    return parsedDate;
  }

  private parseMetadataPayload(metadata: string) {
    try {
      return JSON.parse(metadata);
    } catch {
      throw new BadRequestException('metadata must be valid JSON');
    }
  }

  private normalizeMetadataValue(metadataPayload: unknown, platform: string) {
    const metadataRoot: Record<string, unknown> = this.isRecord(metadataPayload)
      ? { ...metadataPayload }
      : { payload: metadataPayload };
    const nestedMetadata = this.isRecord(metadataRoot.metadata)
      ? metadataRoot.metadata
      : {};

    return {
      ...metadataRoot,
      metadata: {
        ...nestedMetadata,
        platform,
      },
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private async ensureEventIdIsAvailable(eventId: string) {
    const existingDetectionLog = await this.detectionLogsRepo.findOne({
      where: { eventId },
    });

    if (existingDetectionLog) {
      throw new ConflictException(`Detection log ${eventId} already exists`);
    }
  }

  private async getDetectionLogByEventId(eventId: string) {
    const detectionLog = await this.detectionLogsRepo.findOne({
      where: { eventId },
    });

    if (!detectionLog) {
      throw new NotFoundException(`Detection log ${eventId} was not found`);
    }

    return detectionLog;
  }

  private mapDetectionLogToResponse(
    detectionLog: DetectionLog,
    photoUrl: string | null = null,
  ) {
    return {
      id: detectionLog.id,
      eventId: detectionLog.eventId,
      capturedAt: detectionLog.capturedAt.toISOString(),
      eggClusterCount: detectionLog.eggClusterCount,
      platform: detectionLog.platform,
      metadata: detectionLog.metadata,
      bucket: detectionLog.bucket,
      photoPath: detectionLog.photoPath,
      photoOriginalName: detectionLog.photoOriginalName,
      photoMimeType: detectionLog.photoMimeType,
      photoSize: detectionLog.photoSize,
      createdAt: detectionLog.createdAt?.toISOString() ?? null,
      updatedAt: detectionLog.updatedAt?.toISOString() ?? null,
      photoUrl,
    };
  }

  private stringifyError(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
