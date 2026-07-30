import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateShortDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  video_url: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  languages?: string;

  @IsNumber()
  @IsOptional()
  genre_id?: number;

  @IsBoolean()
  @IsOptional()
  is_free?: boolean;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

export class UpdateShortDto extends CreateShortDto {}

export class ShortResponseDto {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  languages: string;
  genre_id: number;
  is_free: boolean;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}
