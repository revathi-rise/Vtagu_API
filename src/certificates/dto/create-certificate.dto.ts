import { IsNotEmpty, IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class CreateCertificateDto {
  @IsNotEmpty({ message: 'Certificate code is required' })
  @IsString()
  @MaxLength(50)
  code: string;

  @IsNotEmpty({ message: 'Certificate name is required' })
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty({ message: 'Certification system is required (e.g., CBFC, MPA, BBFC)' })
  @IsString()
  @MaxLength(100)
  certification_system: string;

  @IsNotEmpty({ message: 'Country is required' })
  @IsString()
  @MaxLength(100)
  country: string;

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
