import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description_short?: string;

  @IsString()
  @IsOptional()
  description_long?: string;

  @IsOptional()
  genre_id?: number | string;

  @IsOptional()
  age_group?: string | number;

  @IsString()
  @IsOptional()
  actors?: string;

  @IsNumber()
  @IsOptional()
  director?: number;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsNumber()
  @IsOptional()
  country_id?: number;

  @IsString()
  @IsOptional()
  quality?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  featured?: number;

  @IsOptional()
  free?: string | boolean;

  @IsOptional()
  kids_restriction?: boolean | number;

  @IsOptional()
  age_restriction?: string;

  @IsOptional()
  episodes?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsString()
  @IsOptional()
  series_image?: string;

  @IsOptional()
  is_coming_soon?: boolean | number;

  @IsNumber()
  @IsOptional()
  certificate_id?: number;

  @IsNumber()
  @IsOptional()
  certificateId?: number;
}

export class UpdateSeriesDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description_short?: string;

  @IsString()
  @IsOptional()
  description_long?: string;

  @IsOptional()
  genre_id?: number | string;

  @IsOptional()
  age_group?: string | number;

  @IsString()
  @IsOptional()
  actors?: string;

  @IsNumber()
  @IsOptional()
  director?: number;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsNumber()
  @IsOptional()
  country_id?: number;

  @IsString()
  @IsOptional()
  quality?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  featured?: number;

  @IsOptional()
  free?: string | boolean;

  @IsOptional()
  kids_restriction?: boolean | number;

  @IsOptional()
  age_restriction?: string;

  @IsOptional()
  episodes?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsString()
  @IsOptional()
  series_image?: string;

  @IsOptional()
  is_coming_soon?: boolean | number;

  @IsNumber()
  @IsOptional()
  certificate_id?: number;

  @IsNumber()
  @IsOptional()
  certificateId?: number;
}
