import { IsString, IsOptional } from 'class-validator';

export class CreatePosterDto {
  @IsString()
  @IsOptional()
  poster_title?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  genres_list?: any;

  @IsOptional()
  genres?: any;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  poster_image?: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsString()
  @IsOptional()
  trailerUrl?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsOptional()
  languages?: any;

  @IsString()
  @IsOptional()
  page_type?: string;

  @IsString()
  @IsOptional()
  pageType?: string;

  @IsOptional()
  reference_id?: any;

  @IsOptional()
  referenceId?: any;

  @IsString()
  @IsOptional()
  reference_type?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsOptional()
  status?: any;

  @IsOptional()
  is_coming_soon?: any;
}

export class UpdatePosterDto {
  @IsString()
  @IsOptional()
  poster_title?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  genres_list?: any;

  @IsOptional()
  genres?: any;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  poster_image?: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsString()
  @IsOptional()
  trailerUrl?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsOptional()
  languages?: any;

  @IsString()
  @IsOptional()
  page_type?: string;

  @IsString()
  @IsOptional()
  pageType?: string;

  @IsOptional()
  reference_id?: any;

  @IsOptional()
  referenceId?: any;

  @IsString()
  @IsOptional()
  reference_type?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsOptional()
  status?: any;

  @IsOptional()
  is_coming_soon?: any;
}
