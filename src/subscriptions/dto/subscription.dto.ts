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

  @IsInt()
  @IsNotEmpty()
  timestamp_from: number;

  @IsInt()
  @IsNotEmpty()
  timestamp_to: number;
}

export class UpdateSubscriptionDto {
  @IsInt()
  @IsOptional()
  status?: number;

  @IsInt()
  @IsOptional()
  payment_status?: number;

  @IsString()
  @IsOptional()
  txnId?: string;
}

export class SubscriptionResponseDto {
  subscriptionId: number;
  userId: number;
  planId: number;
  status: number;
  payment_status: number;
  timestamp_from: number;
  timestamp_to: number;
  payment_method: string;
  price_amount: number;
  paid_amount: number;
  currency: string;
}
