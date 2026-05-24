import { IsInt, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

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
  isFree: boolean;
  viewCount: number;
  media: {
    image: { url: string; alt: string };
    poster_image: { url: string; alt: string };
    card_image: { url: string; alt: string };
    video: { url: string; alt: string };
    trailer: { url: string; alt: string };
  };
  createdAt: Date;
  updatedAt: Date;
}
