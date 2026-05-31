import { IsOptional, IsString } from 'class-validator';

export class CreateInteractiveMovieDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  banner_image?: string;

  @IsString()
  @IsOptional()
  card_image?: string;

  @IsString()
  @IsOptional()
  trailer_video_url?: string;

  @IsString()
  @IsOptional()
  languages?: string;
}

export class UpdateInteractiveMovieDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  banner_image?: string;

  @IsString()
  @IsOptional()
  card_image?: string;

  @IsString()
  @IsOptional()
  trailer_video_url?: string;

  @IsString()
  @IsOptional()
  languages?: string;
}
