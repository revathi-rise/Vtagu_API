import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto, UpdateUserDto, UserResponseDto, AdminLoginDto, AdminResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly mailerService: MailerService,
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
        type: registerDto.type || 'U',
        otp,
        status: '1', // default active status
        register_step: 1,
      });

      const savedUser = await this.usersRepository.save(user);

      // Send OTP via email
      await this.sendOtpEmail(registerDto.email, otp);
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

      if (user.otp !== verifyOtpDto.otp) {
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
   * Admin Login - Only users with type = 1 can login via this endpoint
   */
  async adminLogin(adminLoginDto: AdminLoginDto, ipAddress: string): Promise<{ status: boolean; message: string; data: AdminResponseDto; token: string }> {
    try {
      const user = await this.usersRepository.findOne({ where: { email: adminLoginDto.email } });
      if (!user) {
        console.log(`[ADMIN LOGIN] User not found: ${adminLoginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log(`[ADMIN LOGIN] User found: ${user.email}, type: ${user.type}, status: ${user.status}`);

      // Check if user is admin (type 1)
      if (String(user.type) !== '1') {
        console.log(`[ADMIN LOGIN] User is not admin. Type: ${user.type}`);
        throw new UnauthorizedException('Only administrators can access this endpoint');
      }

      // Check if user account is active (status = 1 or 'active')
      if (String(user.status) !== '1' && user.status !== 'active') {
        console.log(`[ADMIN LOGIN] Admin account not active. Status: ${user.status}`);
        throw new UnauthorizedException('Admin account is not active');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(adminLoginDto.password, user.password);
      console.log(`[ADMIN LOGIN] Password valid: ${isPasswordValid}`);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Update login information
      user.logged_in = true;
      user.log_count = (user.log_count || 0) + 1;
      user.last_login_ip_address = ipAddress;
      user.user_session = this.generateSessionToken();

      const updatedUser = await this.usersRepository.save(user);

      return {
        status: true,
        message: 'Admin login successful',
        data: this.mapAdminToResponse(updatedUser),
        token: updatedUser.user_session,
      };
    } catch (error) {
      console.log(`[ADMIN LOGIN] Error: ${error.message}`);
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

      // Send OTP via email
      await this.sendOtpEmail(forgotPasswordDto.email, otp);
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

      if (user.forgot_otp !== resetPasswordDto.otp) {
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
   * Get all users
   */
  async findAll(): Promise<{ status: boolean; message: string; data: UserResponseDto[] }> {
    try {
      const users = await this.usersRepository.find();
      return {
        status: true,
        message: 'Users fetched successfully',
        data: users.map(user => this.mapUserToResponse(user)),
      };
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

      // Handle snake_case to camelCase mapping for specific fields
      if (updateUserDto.login_oauth_uid) {
        user.loginOauthUid = updateUserDto.login_oauth_uid;
        delete updateUserDto.login_oauth_uid;
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
   * Remove user
   */
  async remove(userId: number): Promise<{ status: boolean; message: string }> {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.usersRepository.remove(user);
      return { status: true, message: 'User deleted successfully' };
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
   */
  private generateOtp(): string {
    // Generate random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Helper: Send OTP via email
   */
  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    // Skip if mailer is not configured or using placeholder
    if (!process.env.MAIL_HOST || process.env.MAIL_HOST === 'smtp.example.com') {
      console.log('--- DEVELOPMENT MODE: EMAIL NOT SENT ---');
      console.log(`To: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log('---------------------------------------');
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `${otp} is your VTAGU verification code`,
        text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
        html: `
          <div style="background-color: #0c0816; padding: 60px 20px; font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
            <div style="max-width: 600px; margin: 0 auto; background: #1a1329; border: 1px solid rgba(178, 140, 255, 0.2); border-radius: 32px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.6);">
              
              <!-- Header with Large Logo -->
              <div style="padding: 50px 0; text-align: center; background: linear-gradient(to bottom, rgba(255, 255, 255, 0.03), transparent);">
                <img src="cid:vtagu_logo" alt="VTAGU Logo" style="height: 120px; width: auto; display: block; margin: 0 auto;" />
              </div>

              <!-- Content Body -->
              <div style="padding: 0 50px 50px; text-align: center;">
                <div style="display: inline-block; padding: 8px 16px; background: rgba(178, 140, 255, 0.1); border-radius: 100px; margin-bottom: 24px;">
                   <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #b28cff; text-transform: uppercase;">Security Verification</span>
                </div>
                
                <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 700; letter-spacing: -1px; color: #ffffff; line-height: 1.2;">Verify Your Identity</h1>
                <p style="margin: 0 0 40px; font-size: 17px; line-height: 1.6; color: rgba(255, 255, 255, 0.7);">
                  We received a request to access your account. Use the following dynamic code to complete your verification.
                </p>

                <!-- Premium OTP Display -->
                <div style="padding: 3px; border-radius: 24px; background: linear-gradient(135deg, #3299ff 0%, #9248ff 100%); display: inline-block; box-shadow: 0 15px 30px rgba(50, 153, 255, 0.3);">
                  <div style="background: #0B0914; padding: 24px 50px; border-radius: 21px;">
                    <span style="font-size: 52px; font-weight: 800; letter-spacing: 12px; color: #ffffff; text-shadow: 0 0 15px rgba(178, 140, 255, 0.4);">${otp}</span>
                  </div>
                </div>

                <div style="margin-top: 40px; padding: 20px; background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                  <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                    <strong>Security Tip:</strong> Never share this code with anyone. VTAGU staff will never ask for your verification code.
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="padding: 40px; text-align: center; background: #0c0816; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.4); line-height: 1.8;">
                  © 2026 VTAGU PrimeTime. All rights reserved.<br>
                  <span style="color: rgba(255, 255, 255, 0.2);">This is an automated security notification.</span>
                </p>
              </div>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: 'vtagu_logo.png',
            path: require('path').join(__dirname, 'vtagu_logo.png'),
            cid: 'vtagu_logo'
          }
        ]
      });
      console.log(`Email sent successfully to ${email}`);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error.message);
    }
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
      type: user.type,
      logged_in: user.logged_in,
      last_login_ip_address: user.last_login_ip_address,
      createdAt: user.createdAt,
    };
  }

  /**
   * Helper: Map user entity to admin response DTO
   */
  private mapAdminToResponse(user: User): AdminResponseDto {
    return {
      userId: user.userId,
      email: user.email,
      user_name: user.user_name,
      status: user.status,
      logged_in: user.logged_in,
      last_login_ip_address: user.last_login_ip_address,
      createdAt: user.createdAt,
    };
  }
}
