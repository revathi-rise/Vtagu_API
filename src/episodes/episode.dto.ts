import { IsInt, IsOptional, IsString, IsBoolean, IsNumber, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

class ImageMediaDto {
  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  alt?: string;
}

class VideoMediaDto {
  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  alt?: string;
}

class MediaDto {
  @ValidateNested()
  @IsOptional()
  @Type(() => ImageMediaDto)
  image?: ImageMediaDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => ImageMediaDto)
  card_image?: ImageMediaDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => VideoMediaDto)
  video?: VideoMediaDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => VideoMediaDto)
  trailer?: VideoMediaDto;
}

export class CreateEpisodeDto {
  @IsInt()
  season_id: number;

  @IsInt()
  @IsOptional()
  episode_number?: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description_short?: string;

  @IsString()
  @IsOptional()
  description_long?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsString()
  @IsOptional()
  trailer_alt?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  poster_image?: string;

  @IsString()
  @IsOptional()
  card_image?: string;

  @IsString()
  @IsOptional()
  poster_alt?: string;

  @IsString()
  @IsOptional()
  languages?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  free?: boolean;

  @IsBoolean()
  @IsOptional()
  is_coming_soon?: boolean;

  @IsOptional()
  subtitles?: any;

  @IsOptional()
  audio_tracks?: any;

  @ValidateNested()
  @IsOptional()
  @Type(() => MediaDto)
  media?: MediaDto;
}

export class UpdateEpisodeDto {
  @IsInt()
  @IsOptional()
  season_id?: number;

  @IsInt()
  @IsOptional()
  episode_number?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description_short?: string;

  @IsString()
  @IsOptional()
  description_long?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsString()
  @IsOptional()
  trailer_alt?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  poster_image?: string;

  @IsString()
  @IsOptional()
  card_image?: string;

  @IsString()
  @IsOptional()
  poster_alt?: string;

  @IsString()
  @IsOptional()
  languages?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  free?: boolean;

  @IsBoolean()
  @IsOptional()
  is_coming_soon?: boolean;

  @IsOptional()
  subtitles?: any;

  @IsOptional()
  audio_tracks?: any;

  @ValidateNested()
  @IsOptional()
  @Type(() => MediaDto)
  media?: MediaDto;
}

export class EpisodeResponseDto {
  id: number;
  season_id: number;
  episode_number: number;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  duration: string;
  languages: string;
  rating: number;
  isFeatured: boolean;
  featured: boolean;
  isFree: boolean;
  free: boolean;
  is_free: boolean;
  isComingSoon: boolean;
  is_coming_soon: boolean;
  viewCount: number;
  media: {
    image: { url: string; alt: string };
    poster_image: { url: string; alt: string };
    card_image: { url: string; alt: string };
    video: { url: string; alt: string };
    trailer: { url: string; alt: string };
  };
  subtitles?: any;
  audio_tracks?: any;
  createdAt: Date;
  updatedAt: Date;
}
