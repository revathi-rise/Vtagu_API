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

  @IsString()
  @IsOptional()
  card_image?: string;

  @IsNumber()
  @IsOptional()
  view_count?: number;

  @IsBoolean()
  @IsOptional()
  is_interactive?: boolean;

  @IsString()
  @IsOptional()
  interactive_map?: string;
  @IsString()
  @IsOptional()
  movie_name?: string;

  @IsString()
  @IsOptional()
  movie_desc?: string;

  @IsString()
  @IsOptional()
  movie_poster?: string;

  @IsString()
  @IsOptional()
  movie_trailer?: string;

  @IsString()
  @IsOptional()
  movie_video?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsString()
  @IsOptional()
  cast_name?: string;

  @IsString()
  @IsOptional()
  director_name?: string;

  @IsString()
  @IsOptional()
  release_date?: string;
}

export class UpdateMovieDto extends CreateMovieDto {}

export class MovieResponseDto {
  id: number;
  title: string;
  movie_name: string;
  slug: string;
  shortDescription: string;
  movie_desc: string;
  longDescription: string;
  releaseYear: number;
  release_date: string;
  countryId: number;
  rating: number;
  genreId: number;
  genre_name: string;
  ageGroup: string;
  actors: string;
  cast_name: string;
  director: string;
  director_name: string;
  isFeatured: boolean;
  isFree: boolean;
  movieType: string;
  contentType: string;
  ageRestriction: string;
  kidsRestriction: boolean;
  duration: string;
  languages: string;
  viewCount: number;
  isInteractive: boolean;
  interactiveMap: string;
  media: {
    image: { url: string; alt: string };
    card_image: { url: string; alt: string };
    video: { url: string; alt: string };
    trailer: { url: string; alt: string };
  };
  createdAt: Date;
  updatedAt: Date;
}
