import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsBoolean()
  @IsOptional()
  paypal_supported?: boolean;

  @IsBoolean()
  @IsOptional()
  stripe_supported?: boolean;
}

export class UpdateCurrencyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  symbol?: string;

  @IsBoolean()
  @IsOptional()
  paypal_supported?: boolean;

  @IsBoolean()
  @IsOptional()
  stripe_supported?: boolean;
}
