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

  @IsString()
  @IsOptional()
  director?: string;

  @IsString()
  @IsOptional()
  actors?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  genre_id?: string;

  @IsString()
  @IsOptional()
  genres?: string;

  @IsOptional()
  total_endings?: number;

  @IsString()
  @IsOptional()
  quality?: string;

  @IsString()
  @IsOptional()
  play_quality?: string;

  @IsString()
  @IsOptional()
  video_quality?: string;

  @IsOptional()
  is_free?: number;

  @IsOptional()
  price?: number;

  @IsOptional()
  currency?: string;

  @IsOptional()
  is_revenue_managed?: number;

  @IsOptional()
  is_svod_eligible?: number;

  @IsOptional()
  revenue_share_percent?: number;

  @IsOptional()
  kids_restriction?: number;

  @IsOptional()
  certificate_id?: number;

  @IsOptional()
  certificateId?: number;
}

// Update DTO inherits fields
export class UpdateInteractiveMovieDto {
  @IsString()
  @IsOptional()
  director?: string;

  @IsString()
  @IsOptional()
  actors?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  genre_id?: string;

  @IsString()
  @IsOptional()
  genres?: string;

  @IsOptional()
  total_endings?: number;
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

  @IsOptional()
  is_free?: number;

  @IsOptional()
  price?: number;

  @IsOptional()
  currency?: string;

  @IsOptional()
  is_revenue_managed?: number;

  @IsOptional()
  is_svod_eligible?: number;

  @IsOptional()
  revenue_share_percent?: number;

  @IsOptional()
  kids_restriction?: number;

  @IsOptional()
  certificate_id?: number;

  @IsOptional()
  certificateId?: number;
}
