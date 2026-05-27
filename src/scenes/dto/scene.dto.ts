import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}

export class UpdateSceneDto {
  @IsString()
  @IsOptional()
  scene_name?: string;

  @IsString()
  @IsOptional()
  scene_url?: string;
}
