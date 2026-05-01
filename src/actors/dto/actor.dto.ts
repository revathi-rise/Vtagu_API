import { IsString, IsNotEmpty } from 'class-validator';

export class CreateActorDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateActorDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
