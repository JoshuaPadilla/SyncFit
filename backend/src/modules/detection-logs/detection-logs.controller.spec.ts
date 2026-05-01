import { Test, TestingModule } from '@nestjs/testing';
import { DetectionLogsController } from './detection-logs.controller';
import { DetectionLogsService } from './detection-logs.service';

describe('DetectionLogsController', () => {
  let controller: DetectionLogsController;
  const detectionLogsService = {
    createDetectionLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetectionLogsController],
      providers: [
        {
          provide: DetectionLogsService,
          useValue: detectionLogsService,
        },
      ],
    }).compile();

    controller = module.get<DetectionLogsController>(DetectionLogsController);
    detectionLogsService.createDetectionLog.mockReset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates uploads to the detection logs service', async () => {
    const photo = {
      buffer: Buffer.from('photo'),
      mimetype: 'image/jpeg',
      originalname: 'snail.jpg',
      size: 5,
    };
    const payload = {
      eventId: 'event-123',
      capturedAt: '2026-05-01T08:00:00.000Z',
      eggClusterCount: 2,
      platform: 'android',
      metadata: JSON.stringify({ metadata: { platform: 'android' } }),
    };
    const expectedResult = { ok: true };

    detectionLogsService.createDetectionLog.mockResolvedValue(expectedResult);

    await expect(
      controller.createDetectionLog(photo, payload),
    ).resolves.toEqual(expectedResult);
    expect(detectionLogsService.createDetectionLog).toHaveBeenCalledWith(
      photo,
      payload,
    );
  });
});
