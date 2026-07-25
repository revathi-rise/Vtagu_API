import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SubtitleDto {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateSceneDto {
  @IsInt()
  @IsNotEmpty()
  movie_id: number;

  @IsString()
  @IsNotEmpty()
  scene_name: string;

  @IsString()
  @IsNotEmpty()
  scene_url: string;

  @IsBoolean()
  @IsOptional()
  is_ending?: boolean;

  @IsString()
  @IsOptional()
  end_text?: string;

  @IsString()
  @IsOptional()
  show_choices_on?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtitleDto)
  @IsOptional()
  subtitles?: SubtitleDto[];
}

export class UpdateSceneDto {
  @IsString()
  @IsOptional()
  scene_name?: string;

  @IsString()
  @IsOptional()
  scene_url?: string;

  @IsBoolean()
  @IsOptional()
  is_ending?: boolean;

  @IsString()
  @IsOptional()
  end_text?: string;

  @IsString()
  @IsOptional()
  show_choices_on?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtitleDto)
  @IsOptional()
  subtitles?: SubtitleDto[];
}
