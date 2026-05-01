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

  @IsNumber()
  @IsOptional()
  genre_id?: number;

  @IsString()
  @IsOptional()
  age_group?: string;

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

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  featured?: number;
}

export class UpdateSeriesDto extends CreateSeriesDto {}
