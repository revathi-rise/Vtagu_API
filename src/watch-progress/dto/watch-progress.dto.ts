import { IsEnum, IsInt, IsNotEmpty, Min, Max } from 'class-validator';
import { ContentType } from '../entities/watch-progress.entity';

export class SaveWatchProgressDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  contentId: number;

  @IsEnum(ContentType)
  @IsNotEmpty()
  contentType: ContentType;

  @IsInt()
  @Min(0)
  watchedDuration: number;

  @IsInt()
  @Min(0)
  totalDuration: number;

  @IsInt()
  @Min(0)
  @Max(100)
  progressPercentage: number;
}

export class GetWatchProgressDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
