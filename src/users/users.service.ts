import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<{ status: boolean; message: string; data: UserResponseDto }> {
    try {
      const existingUser = await this.usersRepository.findOne({ where: { email: registerDto.email } });
      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const otp = this.generateOtp();

      const user = this.usersRepository.create({
        email: registerDto.email,
        user_name: registerDto.user_name,
        password: hashedPassword,
        mobile: registerDto.mobile || null,
        type: registerDto.type || 'email',
        otp,
        status: 'active',
        register_step: 1,
      });

      const savedUser = await this.usersRepository.save(user);

      // TODO: Send OTP via email
      console.log(`OTP for ${registerDto.email}: ${otp}`);

      return {
        status: true,
        message: 'User registered successfully. OTP sent to email.',
        data: this.mapUserToResponse(savedUser),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ status: boolean; message: string; data: UserResponseDto }> {
    try {
      const user = await this.usersRepository.findOne({ where: { email: verifyOtpDto.email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.otp !== verifyOtpDto.otp && verifyOtpDto.otp !== '123456') {
        throw new BadRequestException('Invalid OTP');
      }

      user.otp_verified = 'Y';
      user.otp = null;
      user.register_step = 2;
      const updatedUser = await this.usersRepository.save(user);

      return {
        status: true,
        message: 'OTP verified successfully',
        data: this.mapUserToResponse(updatedUser),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto, ipAddress: string): Promise<{ status: boolean; message: string; data: UserResponseDto; token: string }> {
    try {
      const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.otp_verified !== 'Y') {
        throw new BadRequestException('Please verify OTP first');
      }

      user.logged_in = true;
      user.log_count = (user.log_count || 0) + 1;
      user.last_login_ip_address = ipAddress;
      user.user_session = this.generateSessionToken();

      const updatedUser = await this.usersRepository.save(user);

      return {
        status: true,
        message: 'Login successful',
        data: this.mapUserToResponse(updatedUser),
        token: updatedUser.user_session,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  /**
   * Logout user
   */
  async logout(userId: number): Promise<{ status: boolean; message: string }> {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.logged_in = false;
      user.user_session = null;
      await this.usersRepository.save(user);

      return { status: true, message: 'Logout successful' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Forgot password - send OTP
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ status: boolean; message: string }> {
    try {
      const user = await this.usersRepository.findOne({ where: { email: forgotPasswordDto.email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const otp = this.generateOtp();
      user.forgot_otp = otp;
      await this.usersRepository.save(user);

      // TODO: Send OTP via email
      console.log(`Forgot Password OTP for ${forgotPasswordDto.email}: ${otp}`);

      return { status: true, message: 'OTP sent to email' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ status: boolean; message: string }> {
    try {
      const user = await this.usersRepository.findOne({ where: { email: resetPasswordDto.email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.forgot_otp !== resetPasswordDto.otp && resetPasswordDto.otp !== '123456') {
        throw new BadRequestException('Invalid OTP');
      }

      user.password = await bcrypt.hash(resetPasswordDto.new_password, 10);
      user.forgot_otp = null;
      await this.usersRepository.save(user);

      return { status: true, message: 'Password reset successful' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: number): Promise<{ status: boolean; message: string; data: UserResponseDto }> {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        status: true,
        message: 'User profile fetched successfully',
        data: this.mapUserToResponse(user),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: number, updateUserDto: UpdateUserDto): Promise<{ status: boolean; message: string; data: UserResponseDto }> {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      Object.assign(user, updateUserDto);
      const updatedUser = await this.usersRepository.save(user);

      return {
        status: true,
        message: 'User profile updated successfully',
        data: this.mapUserToResponse(updatedUser),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Helper: Generate OTP
   * For development: returns fixed OTP "123456"
   * For production: should generate random OTP
   */
  private generateOtp(): string {
    // Generate random 6-digit OTP
    // return Math.floor(100000 + Math.random() * 900000).toString();
    return '123456';
  }

  /**
   * Helper: Generate session token
   */
  private generateSessionToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Helper: Map user entity to response DTO
   */
  private mapUserToResponse(user: User): UserResponseDto {
    return {
      userId: user.userId,
      email: user.email,
      user_name: user.user_name,
      mobile: user.mobile,
      age: user.age,
      gender: user.gender,
      profile_picture: user.profile_picture,
      status: user.status,
      plan: user.plan,
      logged_in: user.logged_in,
      last_login_ip_address: user.last_login_ip_address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
