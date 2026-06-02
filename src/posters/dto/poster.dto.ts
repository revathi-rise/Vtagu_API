import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreatePosterDto {
  @IsString()
  @IsOptional()
  poster_title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  genres_list?: string;

  @IsString()
  path: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  languages?: string;

  @IsString()
  @IsOptional()
  page_type?: string;

  @IsInt()
  @IsOptional()
  reference_id?: number;

  @IsString()
  @IsOptional()
  reference_type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['A', 'I'])
  status?: string;
}

export class UpdatePosterDto {
  @IsString()
  @IsOptional()
  poster_title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  genres_list?: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  languages?: string;

  @IsString()
  @IsOptional()
  page_type?: string;

  @IsInt()
  @IsOptional()
  reference_id?: number;

  @IsString()
  @IsOptional()
  reference_type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['A', 'I'])
  status?: string;
}
