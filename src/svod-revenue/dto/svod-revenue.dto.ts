import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class LogWatchTimeDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  film_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  seconds_watched: number;
}

export class RunMonthlySplitDto {
  @IsOptional()
  @IsString()
  month_year?: string; // Format: "MM-YYYY", e.g. "09-2026"
}

export class CreateUserSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subscription_fee: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gateway_fee?: number;

  @IsOptional()
  @IsString()
  month_year?: string;
}
