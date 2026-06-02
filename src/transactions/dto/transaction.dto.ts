import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  txn_id: string;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  txn_id?: string;

  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
