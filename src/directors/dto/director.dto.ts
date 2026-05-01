import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDirectorDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateDirectorDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
