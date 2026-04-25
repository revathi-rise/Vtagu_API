import { IsString, IsNumber, IsOptional, IsBoolean, ValidateNested, IsUrl } from 'class-validator';
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
  @Type(() => ImageMediaDto)
  image: ImageMediaDto;

  @ValidateNested()
  @Type(() => VideoMediaDto)
  video: VideoMediaDto;
}

export class CreateMovieDto {
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

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  genre_id?: number;

  @ValidateNested()
  @IsOptional()
  @Type(() => MediaDto)
  media?: MediaDto;

  // Additional fields from mapping table
  @IsNumber()
  @IsOptional()
  country_id?: number;

  @IsString()
  @IsOptional()
  age_group?: string;

  @IsString()
  @IsOptional()
  actors?: string;

  @IsString()
  @IsOptional()
  director?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  free?: boolean;

  @IsString()
  @IsOptional()
  movie_type?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  age_restriction?: string;

  @IsBoolean()
  @IsOptional()
  kids_restriction?: boolean;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  languages?: string;

  @IsNumber()
  @IsOptional()
  view_count?: number;

  @IsBoolean()
  @IsOptional()
  is_interactive?: boolean;

  @IsString()
  @IsOptional()
  interactive_map?: string;
}

export class UpdateMovieDto extends CreateMovieDto {}

export class MovieResponseDto {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  releaseYear: number;
  countryId: number;
  rating: number;
  genreId: number;
  ageGroup: string;
  actors: string;
  director: string;
  isFeatured: boolean;
  isFree: boolean;
  movieType: string;
  contentType: string;
  ageRestriction: string;
  kidsRestriction: boolean;
  videoUrl: string;
  trailerUrl: string;
  trailerAlt: string;
  posterImage: string;
  posterAlt: string;
  duration: string;
  languages: string;
  viewCount: number;
  isInteractive: boolean;
  interactiveMap: string;
  createdAt: Date;
  updatedAt: Date;
}
