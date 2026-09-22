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
}
