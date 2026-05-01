import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase.service';
import { DetectionLogsService } from './detection-logs.service';

describe('DetectionLogsService', () => {
  let service: DetectionLogsService;
  const remove = jest.fn();
  const upload = jest.fn();
  const from = jest.fn(() => ({
    upload,
    remove,
  }));
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
      ],
    }).compile();

    service = module.get<DetectionLogsService>(DetectionLogsService);
    from.mockClear();
    upload.mockReset();
    remove.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uploads the photo and metadata document to Supabase storage', async () => {
    upload
      .mockResolvedValueOnce({ data: { path: 'photo' }, error: null })
      .mockResolvedValueOnce({ data: { path: 'metadata' }, error: null });

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
    expect(upload).toHaveBeenNthCalledWith(
      2,
      '2026/05/01/event-123-2026-05-01T08-00-00-000Z.json',
      expect.any(Buffer),
      expect.objectContaining({
        contentType: 'application/json',
        upsert: false,
      }),
    );
    expect(result).toEqual({
      ok: true,
      bucket: 'snail-detected',
      eventId: 'event-123',
      photoPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.jpg',
      metadataPath: '2026/05/01/event-123-2026-05-01T08-00-00-000Z.json',
    });
  });

  it('rejects uploads larger than 2 MB before calling storage', async () => {
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
});
