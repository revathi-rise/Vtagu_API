import { IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class CreateUserDeviceDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  device_id: string;

  @IsString()
  @IsNotEmpty()
  device_name: string;

  @IsString()
  @IsOptional()
  device_type?: string;

  @IsString()
  @IsOptional()
  os?: string;

  @IsString()
  @IsOptional()
  os_version?: string;

  @IsString()
  @IsOptional()
  app_version?: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  user_agent?: string;
}

export class UpdateUserDeviceDto {
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsDateString()
  @IsOptional()
  last_active?: string;

  @IsString()
  @IsOptional()
  app_version?: string;
}

export class UserDeviceResponseDto {
  id: number;
  userId: number;
  device_id: string;
  device_name: string;
  device_type: string;
  os: string;
  os_version: string;
  is_active: boolean;
  last_active: Date;
  created_at: Date;
}
