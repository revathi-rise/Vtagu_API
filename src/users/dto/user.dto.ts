import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  type?: string; // 'email', 'phone'
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  new_password: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  user_name?: string;

  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  profile_picture?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  role?: string;

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
  upi?: string;

  @IsString()
  @IsOptional()
  plan?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  user_movielist?: string;

  @IsString()
  @IsOptional()
  user_serieslist?: string;

  @IsString()
  @IsOptional()
  user_movie_fav?: string;

  @IsString()
  @IsOptional()
  user_series_fav?: string;

  @IsOptional()
  register_step?: number;

  @IsString()
  @IsOptional()
  login_oauth_uid?: string;

  @IsString()
  @IsOptional()
  login_otp?: string;
}

export class UserResponseDto {
  userId: number;
  email: string;
  user_name: string;
  mobile: string;
  age: number;
  gender: string;
  profile_picture: string;
  status: string;
  plan: string;
  role: string;
  type: string;
  logged_in: boolean;
  last_login_ip_address: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AdminResponseDto {
  userId: number;
  email: string;
  user_name: string;
  role: string;
  status: string;
  logged_in: boolean;
  last_login_ip_address: string;
  createdAt: Date;
}
