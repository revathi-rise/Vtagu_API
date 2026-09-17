import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

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

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  price_amount?: number;

  @IsNumber()
  @IsOptional()
  paid_amount?: number;

  @IsInt()
  @IsOptional()
  payment_status?: number;

  @IsString()
  @IsOptional()
  txnId?: string;

  @IsString()
  @IsOptional()
  txn_id?: string;

  @IsString()
  @IsOptional()
  card_name?: string;

  @IsString()
  @IsOptional()
  card_number?: string;

  @IsString()
  @IsOptional()
  card_expiry?: string;

  @IsString()
  @IsOptional()
  card_ccv?: string;

  @IsString()
  @IsOptional()
  card_ccc?: string;

  @IsString()
  @IsOptional()
  upi?: string;

  @IsString()
  @IsOptional()
  plan_name?: string;
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

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  price_amount?: number;

  @IsNumber()
  @IsOptional()
  paid_amount?: number;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsString()
  @IsOptional()
  payment_details?: string;

  @IsInt()
  @IsOptional()
  timestamp_from?: number;

  @IsInt()
  @IsOptional()
  timestamp_to?: number;

  @IsString()
  @IsOptional()
  card_name?: string;

  @IsString()
  @IsOptional()
  card_number?: string;

  @IsString()
  @IsOptional()
  card_expiry?: string;

  @IsString()
  @IsOptional()
  card_ccv?: string;

  @IsString()
  @IsOptional()
  card_ccc?: string;

  @IsString()
  @IsOptional()
  upi?: string;

  @IsString()
  @IsOptional()
  plan_name?: string;
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
  is_interactive_included?: number;
  isInteractiveIncluded?: number;
  is_standard_included?: number;
  isStandardIncluded?: number;
  plan?: {
    planId: number;
    name: string;
    price: number;
    validity: string;
    is_interactive_included: number;
    isInteractiveIncluded: number;
    is_standard_included: number;
    isStandardIncluded: number;
    screens: number | string;
    quality: string;
    compatibility: number;
    unlimited: number;
    cancellation: number;
  };
}
