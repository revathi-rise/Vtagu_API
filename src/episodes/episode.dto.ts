import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateEpisodeDto {
  @IsInt()
  seasonId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class UpdateEpisodeDto {
  @IsInt()
  @IsOptional()
  seasonId?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
