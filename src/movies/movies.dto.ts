import { IsString, IsNumber, IsOptional, IsBoolean, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

class ImageMediaDto {
  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  alt?: string;
}

class VideoMediaDto {
  @IsUrl()
  @IsOptional()
  url?: string;

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

  @IsString()
  @IsOptional()
  genre_id?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => MediaDto)
  media?: MediaDto;

  // Additional fields from mapping table
  @IsNumber()
  @IsOptional()
  country_id?: number;

  @IsNumber()
  @IsOptional()
  certificate_id?: number;

  @IsNumber()
  @IsOptional()
  certificateId?: number;

  @IsString()
  @IsOptional()
  age_group?: string;

  @IsString()
  @IsOptional()
  actors?: string;

  @IsString()
  @IsOptional()
  director?: string;

  @IsOptional()
  featured?: boolean;

  @IsOptional()
  isFeatured?: boolean;

  @IsOptional()
  is_featured?: boolean;

  @IsOptional()
  free?: boolean;

  @IsOptional()
  isFree?: boolean;

  @IsOptional()
  is_free?: boolean;

  @IsString()
  @IsOptional()
  movie_type?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  age_restriction?: string;

  @IsString()
  @IsOptional()
  certificate_system?: string;

  @IsString()
  @IsOptional()
  certificateSystem?: string;

  @IsString()
  @IsOptional()
  official_certificate?: string;

  @IsString()
  @IsOptional()
  officialCertificate?: string;

  @IsString()
  @IsOptional()
  certificate_country?: string;

  @IsString()
  @IsOptional()
  certificateCountry?: string;

  @IsNumber()
  @IsOptional()
  certificate_year?: number;

  @IsNumber()
  @IsOptional()
  certificateYear?: number;

  @IsString()
  @IsOptional()
  platform_age_rating?: string;

  @IsString()
  @IsOptional()
  platformAgeRating?: string;

  @IsOptional()
  content_advisories?: string[];

  @IsOptional()
  contentAdvisories?: string[];

  @IsBoolean()
  @IsOptional()
  certification_verified?: boolean;

  @IsBoolean()
  @IsOptional()
  certificationVerified?: boolean;

  @IsString()
  @IsOptional()
  certification_source?: string;

  @IsString()
  @IsOptional()
  certificationSource?: string;

  @IsBoolean()
  @IsOptional()
  kids_restriction?: boolean;
  @IsBoolean()
  @IsOptional()
  is_kids_approved?: boolean;
  @IsBoolean()
  @IsOptional()
  isKidsApproved?: boolean;
  @IsBoolean()
  @IsOptional()
  kids_only?: boolean;
  @IsBoolean()
  @IsOptional()
  kidsOnly?: boolean;

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

  @IsBoolean()
  @IsOptional()
  is_coming_soon?: boolean;

  @IsOptional()
  is_revenue_managed?: boolean;

  @IsOptional()
  isRevenueManaged?: boolean;

  @IsOptional()
  is_revenue_shared?: boolean;

  @IsOptional()
  is_pro_rata_included?: boolean;

  @IsString()
  @IsOptional()
  interactive_map?: string;

  @IsOptional()
  subtitles?: any;

  @IsOptional()
  audio_tracks?: any;

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
  genreId: string;
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
  age_restriction?: string;
  certificate_id?: number;
  certificateId?: number;
  certificate?: {
    id: number;
    code: string;
    name: string;
    certification_system: string;
    country: string;
    maturity_level?: string;
    badge_color?: string;
    description?: string;
  } | null;
  certificate_system?: string;
  certificateSystem?: string;
  official_certificate?: string;
  officialCertificate?: string;
  certificate_country?: string;
  certificateCountry?: string;
  certificate_year?: number;
  certificateYear?: number;
  platform_age_rating?: string;
  platformAgeRating?: string;
  content_advisories?: string[];
  contentAdvisories?: string[];
  certification_verified?: boolean;
  certificationVerified?: boolean;
  certification_source?: string;
  certificationSource?: string;
  kidsRestriction: boolean;
  kids_restriction?: boolean;
  isKidsApproved?: boolean;
  is_kids_approved?: boolean;
  kids_only?: boolean;
  kidsOnly?: boolean;
  duration: string;
  languages: string;
  viewCount: number;
  isInteractive: boolean;
  isComingSoon: boolean;
  is_coming_soon: boolean;
  isRevenueManaged: boolean;
  is_revenue_managed: boolean;
  interactiveMap: string;
  url?: string;
  video_url?: string;
  videoUrl?: string;
  trailer_url?: string;
  trailerUrl?: string;
  movie_image?: string;
  card_image?: string;
  media: {
    image: { url: string; alt: string };
    card_image: { url: string; alt: string };
    video: { url: string; alt: string };
    trailer: { url: string; alt: string };
  };
  subtitles?: any;
  audio_tracks?: any;
  createdAt: Date;
  updatedAt: Date;
}

