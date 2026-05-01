import { Test, TestingModule } from '@nestjs/testing';
import { DetectionLogsController } from './detection-logs.controller';
import { DetectionLogsService } from './detection-logs.service';

describe('DetectionLogsController', () => {
  let controller: DetectionLogsController;
  const detectionLogsService = {
    createDetectionLog: jest.fn(),
    findAllDetectionLogs: jest.fn(),
    findOneDetectionLog: jest.fn(),
    updateDetectionLog: jest.fn(),
    deleteDetectionLog: jest.fn(),
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
    detectionLogsService.findAllDetectionLogs.mockReset();
    detectionLogsService.findOneDetectionLog.mockReset();
    detectionLogsService.updateDetectionLog.mockReset();
    detectionLogsService.deleteDetectionLog.mockReset();
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

  it('delegates listing detection logs to the detection logs service', async () => {
    const expectedResult = [{ eventId: 'event-123' }];

    detectionLogsService.findAllDetectionLogs.mockResolvedValue(expectedResult);

    await expect(controller.findAllDetectionLogs()).resolves.toEqual(
      expectedResult,
    );
    expect(detectionLogsService.findAllDetectionLogs).toHaveBeenCalled();
  });

  it('delegates fetching one detection log to the detection logs service', async () => {
    const expectedResult = { eventId: 'event-123' };

    detectionLogsService.findOneDetectionLog.mockResolvedValue(expectedResult);

    await expect(controller.findOneDetectionLog('event-123')).resolves.toEqual(
      expectedResult,
    );
    expect(detectionLogsService.findOneDetectionLog).toHaveBeenCalledWith(
      'event-123',
    );
  });

  it('delegates updating one detection log to the detection logs service', async () => {
    const payload = {
      eggClusterCount: 3,
    };
    const expectedResult = { eventId: 'event-123', eggClusterCount: 3 };

    detectionLogsService.updateDetectionLog.mockResolvedValue(expectedResult);

    await expect(
      controller.updateDetectionLog('event-123', payload),
    ).resolves.toEqual(expectedResult);
    expect(detectionLogsService.updateDetectionLog).toHaveBeenCalledWith(
      'event-123',
      payload,
    );
  });

  it('delegates deleting one detection log to the detection logs service', async () => {
    const expectedResult = { message: 'Detection log deleted successfully' };

    detectionLogsService.deleteDetectionLog.mockResolvedValue(expectedResult);

    await expect(controller.deleteDetectionLog('event-123')).resolves.toEqual(
      expectedResult,
    );
    expect(detectionLogsService.deleteDetectionLog).toHaveBeenCalledWith(
      'event-123',
    );
  });
});
