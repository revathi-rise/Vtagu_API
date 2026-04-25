import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsInt()
  @IsNotEmpty()
  planId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsString()
  @IsOptional()
  payment_details?: string;

  @IsDateString()
  @IsNotEmpty()
  timestamp_from: string;

  @IsDateString()
  @IsNotEmpty()
  timestamp_to: string;
}

export class UpdateSubscriptionDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  payment_status?: string;

  @IsString()
  @IsOptional()
  txnId?: string;
}

export class SubscriptionResponseDto {
  subscriptionId: number;
  userId: number;
  planId: number;
  status: string;
  payment_status: string;
  timestamp_from: Date;
  timestamp_to: Date;
  payment_method: string;
  price_amount: number;
  paid_amount: number;
  currency: string;
}
