import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class UpdateCertificateDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  certification_system?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  maturity_level?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  badge_color?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], { message: 'Status must be active or inactive' })
  status?: string;
}

