import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DetectionLog } from '../../entities/detection_log.entity';
import { SupabaseService } from '../supabase.service';
import { DetectionLogsService } from './detection-logs.service';

describe('DetectionLogsService', () => {
  let service: DetectionLogsService;
  const create = jest.fn();
  const find = jest.fn();
  const findOne = jest.fn();
  const save = jest.fn();
  const deleteDetectionLog = jest.fn();
  const softDelete = jest.fn();
  const createSignedUrl = jest.fn();
  const createSignedUrls = jest.fn();
  const remove = jest.fn();
  const upload = jest.fn();
  const from = jest.fn(() => ({
    createSignedUrl,
    createSignedUrls,
    remove,
    upload,
  }));
  const detectionLogsRepo = {
    create,
    find,
    findOne,
    save,
    delete: deleteDetectionLog,
    softDelete,
  };
  const supabaseService = {
    client: {
      storage: {
        from,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetectionLogsService,
        {
          provide: SupabaseService,
          useValue: supabaseService,
        },
        {
          provide: getRepositoryToken(DetectionLog),
          useValue: detectionLogsRepo,
        },
      ],
    }).compile();

    service = module.get<DetectionLogsService>(DetectionLogsService);
    from.mockClear();
    create.mockReset();
    find.mockReset();
    findOne.mockReset();
    save.mockReset();
    deleteDetectionLog.mockReset();
    softDelete.mockReset();
    createSignedUrl.mockReset();
    createSignedUrls.mockReset();
    remove.mockReset();
    upload.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uploads the photo, persists the entity, and syncs metadata documents', async () => {
    const createdDetectionLog = {
      eventId: 'event-123',
      capturedAt: new Date('2026-05-01T08:00:00.000Z'),
      eggClusterCount: 2,
      platform: 'android',
      metadata: { metadata: { platform: 'android' } },
      bucket: 'snail-detected',
      photoPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
      photoOriginalName: 'snail.jpg',
      photoMimeType: 'image/jpeg',
      photoSize: 5,
    };
    const savedDetectionLog = {
      id: 'detection-1',
      ...createdDetectionLog,
      createdAt: new Date('2026-05-01T08:05:00.000Z'),
      updatedAt: new Date('2026-05-01T08:05:00.000Z'),
      deletedAt: null,
    };

    findOne.mockResolvedValueOnce(null);
    create.mockReturnValue(createdDetectionLog);
    save.mockResolvedValueOnce(savedDetectionLog);
    upload.mockResolvedValueOnce({ data: { path: 'photo' }, error: null });

    const result = await service.createDetectionLog(
      {
        buffer: Buffer.from('photo'),
        mimetype: 'image/jpeg',
        originalname: 'snail.jpg',
        size: 5,
      },
      {
        eventId: 'event-123',
        capturedAt: '2026-05-01T08:00:00.000Z',
        eggClusterCount: 2,
        platform: 'android',
        metadata: JSON.stringify({ metadata: { platform: 'android' } }),
      },
    );

    expect(findOne).toHaveBeenCalledWith({ where: { eventId: 'event-123' } });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'event-123',
        platform: 'android',
        bucket: 'snail-detected',
      }),
    );
    expect(save).toHaveBeenCalledWith(createdDetectionLog);
    expect(from).toHaveBeenCalledWith('snail-detected');
    expect(upload).toHaveBeenNthCalledWith(
      1,
      '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
      expect.any(Buffer),
      expect.objectContaining({
        contentType: 'image/jpeg',
        upsert: false,
      }),
    );
    expect(upload).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 'detection-1',
      eventId: 'event-123',
      capturedAt: '2026-05-01T08:00:00.000Z',
      eggClusterCount: 2,
      platform: 'android',
      metadata: { metadata: { platform: 'android' } },
      bucket: 'snail-detected',
      photoPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
      photoOriginalName: 'snail.jpg',
      photoMimeType: 'image/jpeg',
      photoSize: 5,
      createdAt: '2026-05-01T08:05:00.000Z',
      updatedAt: '2026-05-01T08:05:00.000Z',
      photoUrl: null,
    });
  });

  it('rejects uploads larger than 2 MB before calling storage', async () => {
    findOne.mockResolvedValueOnce(null);

    await expect(
      service.createDetectionLog(
        {
          buffer: Buffer.alloc(1),
          mimetype: 'image/jpeg',
          originalname: 'snail.jpg',
          size: 2 * 1024 * 1024 + 1,
        },
        {
          eventId: 'event-123',
          capturedAt: '2026-05-01T08:00:00.000Z',
          eggClusterCount: 2,
          platform: 'android',
          metadata: JSON.stringify({ metadata: { platform: 'android' } }),
        },
      ),
    ).rejects.toThrow('photo must be 2 MB or smaller');

    expect(from).not.toHaveBeenCalled();
  });

  it('lists all detection logs with signed photo URLs', async () => {
    find.mockResolvedValueOnce([
      {
        id: 'detection-2',
        eventId: 'event-456',
        capturedAt: new Date('2026-05-02T08:00:00.000Z'),
        eggClusterCount: 4,
        platform: 'android',
        metadata: { metadata: { platform: 'android' } },
        bucket: 'snail-detected',
        photoPath: '2026/05/02/event-456-2026-05-02T08-00-00-000Z.jpg',
        photoOriginalName: 'snail-2.jpg',
        photoMimeType: 'image/jpeg',
        photoSize: 7,
        createdAt: new Date('2026-05-02T08:05:00.000Z'),
        updatedAt: new Date('2026-05-02T08:05:00.000Z'),
        deletedAt: null,
      },
      {
        id: 'detection-1',
        eventId: 'event-123',
        capturedAt: new Date('2026-05-01T08:00:00.000Z'),
        eggClusterCount: 2,
        platform: 'android',
        metadata: { metadata: { platform: 'android' } },
        bucket: 'snail-detected',
        photoPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
        photoOriginalName: 'snail.jpg',
        photoMimeType: 'image/jpeg',
        photoSize: 5,
        createdAt: new Date('2026-05-01T08:05:00.000Z'),
        updatedAt: new Date('2026-05-01T08:05:00.000Z'),
        deletedAt: null,
      },
    ]);
    createSignedUrls.mockResolvedValueOnce({
      data: [
        {
          error: null,
          path: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
          signedUrl: 'https://example.com/event-123',
        },
        {
          error: null,
          path: '2026/05/02/event-456-2026-05-02T08-00-00-000Z.jpg',
          signedUrl: 'https://example.com/event-456',
        },
      ],
      error: null,
    });

    await expect(service.findAllDetectionLogs()).resolves.toEqual([
      {
        id: 'detection-2',
        eventId: 'event-456',
        capturedAt: '2026-05-02T08:00:00.000Z',
        eggClusterCount: 4,
        platform: 'android',
        metadata: { metadata: { platform: 'android' } },
        bucket: 'snail-detected',
        photoPath: '2026/05/02/event-456-2026-05-02T08-00-00-000Z.jpg',
        photoOriginalName: 'snail-2.jpg',
        photoMimeType: 'image/jpeg',
        photoSize: 7,
        createdAt: '2026-05-02T08:05:00.000Z',
        updatedAt: '2026-05-02T08:05:00.000Z',
        photoUrl: 'https://example.com/event-456',
      },
      {
        id: 'detection-1',
        eventId: 'event-123',
        capturedAt: '2026-05-01T08:00:00.000Z',
        eggClusterCount: 2,
        platform: 'android',
        metadata: { metadata: { platform: 'android' } },
        bucket: 'snail-detected',
        photoPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
        photoOriginalName: 'snail.jpg',
        photoMimeType: 'image/jpeg',
        photoSize: 5,
        createdAt: '2026-05-01T08:05:00.000Z',
        updatedAt: '2026-05-01T08:05:00.000Z',
        photoUrl: 'https://example.com/event-123',
      },
    ]);
    expect(find).toHaveBeenCalledWith({
      order: {
        capturedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  });

  it('fetches one detection log with a signed photo URL', async () => {
    findOne.mockResolvedValueOnce({
      id: 'detection-1',
      eventId: 'event-123',
      capturedAt: new Date('2026-05-01T08:00:00.000Z'),
      eggClusterCount: 2,
      platform: 'android',
      metadata: { metadata: { platform: 'android' } },
      bucket: 'snail-detected',
      photoPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
      photoOriginalName: 'snail.jpg',
      photoMimeType: 'image/jpeg',
      photoSize: 5,
      createdAt: new Date('2026-05-01T08:05:00.000Z'),
      updatedAt: new Date('2026-05-01T08:05:00.000Z'),
      deletedAt: null,
    });
    createSignedUrl.mockResolvedValueOnce({
      data: {
        signedUrl: 'https://example.com/event-123',
      },
      error: null,
    });

    await expect(service.findOneDetectionLog('event-123')).resolves.toEqual({
      id: 'detection-1',
      eventId: 'event-123',
      capturedAt: '2026-05-01T08:00:00.000Z',
      eggClusterCount: 2,
      platform: 'android',
      metadata: { metadata: { platform: 'android' } },
      bucket: 'snail-detected',
      photoPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
      photoOriginalName: 'snail.jpg',
      photoMimeType: 'image/jpeg',
      photoSize: 5,
      createdAt: '2026-05-01T08:05:00.000Z',
      updatedAt: '2026-05-01T08:05:00.000Z',
      photoUrl: 'https://example.com/event-123',
    });
    expect(findOne).toHaveBeenCalledWith({ where: { eventId: 'event-123' } });
    expect(createSignedUrl).toHaveBeenCalledWith(
      '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
      3600,
    );
  });

  it('updates a detection log and syncs metadata documents', async () => {
    const detectionLog = {
      id: 'detection-1',
      eventId: 'event-123',
      capturedAt: new Date('2026-05-01T08:00:00.000Z'),
      eggClusterCount: 2,
      platform: 'android',
      metadata: { metadata: { platform: 'android' } },
      bucket: 'snail-detected',
      photoPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
      metadataPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.json',
      photoOriginalName: 'snail.jpg',
      photoMimeType: 'image/jpeg',
      photoSize: 5,
      createdAt: new Date('2026-05-01T08:05:00.000Z'),
      updatedAt: new Date('2026-05-01T08:05:00.000Z'),
      deletedAt: null,
    };

    findOne.mockResolvedValueOnce(detectionLog);
    save.mockResolvedValueOnce({
      ...detectionLog,
      eggClusterCount: 3,
      updatedAt: new Date('2026-05-01T09:05:00.000Z'),
    });
    createSignedUrl.mockResolvedValueOnce({
      data: {
        signedUrl: 'https://example.com/event-123',
      },
      error: null,
    });

    await expect(
      service.updateDetectionLog('event-123', { eggClusterCount: 3 }),
    ).resolves.toEqual(
      expect.objectContaining({
        eventId: 'event-123',
        eggClusterCount: 3,
        photoUrl: 'https://example.com/event-123',
      }),
    );
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        eggClusterCount: 3,
      }),
    );
    expect(upload).not.toHaveBeenCalled();
  });

  it('soft deletes a detection log and removes storage artifacts', async () => {
    findOne.mockResolvedValueOnce({
      id: 'detection-1',
      eventId: 'event-123',
      capturedAt: new Date('2026-05-01T08:00:00.000Z'),
      eggClusterCount: 2,
      platform: 'android',
      metadata: { metadata: { platform: 'android' } },
      bucket: 'snail-detected',
      photoPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
      photoOriginalName: 'snail.jpg',
      photoMimeType: 'image/jpeg',
      photoSize: 5,
      createdAt: new Date('2026-05-01T08:05:00.000Z'),
      updatedAt: new Date('2026-05-01T08:05:00.000Z'),
      deletedAt: null,
    });
    remove.mockResolvedValueOnce({ data: [], error: null });
    softDelete.mockResolvedValueOnce({ affected: 1 });

    await expect(service.deleteDetectionLog('event-123')).resolves.toEqual({
      message: 'Detection log deleted successfully',
    });
    expect(remove).toHaveBeenCalledWith([
      '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
    ]);
    expect(softDelete).toHaveBeenCalledWith('detection-1');
  });
});
