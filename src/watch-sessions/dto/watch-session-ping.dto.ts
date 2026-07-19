import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class WatchSessionPingDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsNumber()
  contentId: number;

  @IsNotEmpty()
  @IsString()
  contentType: string;
}
