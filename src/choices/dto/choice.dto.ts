import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChoiceDto {
  @IsInt()
  @IsNotEmpty()
  scene_id: number;

  @IsString()
  @IsNotEmpty()
  button_text: string;

  @IsInt()
  @IsOptional()
  target_scene?: number;
}

export class UpdateChoiceDto {
  @IsInt()
  @IsNotEmpty()
  choice_id: number;

  @IsString()
  @IsOptional()
  button_text?: string;

  @IsInt()
  @IsOptional()
  target_scene?: number;
}
