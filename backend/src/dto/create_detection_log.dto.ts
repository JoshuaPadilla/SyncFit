import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateDetectionLogDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsISO8601()
  capturedAt: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  eggClusterCount: number;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  metadata: string;
}