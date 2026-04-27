import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  screens: number;

  @IsString()
  @IsNotEmpty()
  quality: string;

  @IsInt()
  @IsNotEmpty()
  compatibility: number;

  @IsInt()
  @IsNotEmpty()
  unlimited: number;

  @IsInt()
  @IsNotEmpty()
  cancellation: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @IsString()
  @IsNotEmpty()
  validity: string;

  @IsInt()
  @IsOptional()
  status?: number;
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  screens?: number;

  @IsString()
  @IsOptional()
  quality?: string;

  @IsInt()
  @IsOptional()
  compatibility?: number;

  @IsInt()
  @IsOptional()
  unlimited?: number;

  @IsInt()
  @IsOptional()
  cancellation?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  validity?: string;

  @IsInt()
  @IsOptional()
  status?: number;
}

export class PlanResponseDto {
  planId: number;
  name: string;
  screens: number;
  quality: string;
  compatibility: number;
  unlimited: number;
  cancellation: number;
  price: number;
  discount: number;
  validity: string;
  status: number;
}
