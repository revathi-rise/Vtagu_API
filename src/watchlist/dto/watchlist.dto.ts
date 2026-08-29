import { IsInt, IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class AddToWatchlistDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  contentId: number;

  @IsString()
  @IsOptional()
  @IsIn(['movie', 'series', 'interactive_movie', 'short'])
  contentType?: string = 'movie';
}

export class RemoveFromWatchlistDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  contentId: number;

  @IsString()
  @IsOptional()
  @IsIn(['movie', 'series', 'interactive_movie', 'short'])
  contentType?: string = 'movie';
}

export class WatchlistResponseDto {
  id: number;
  userId: number;
  contentId: number;
  contentType: string;
  createdAt: Date;
  details?: any;
}
