import { Controller, Get, Post, Body, Param, Patch, Delete, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto, LoginDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto, UpdateUserDto, AdminLoginDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Register a new user
   * POST /users/register
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  /**
   * Verify OTP
   * POST /users/verify-otp
   */
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.usersService.verifyOtp(verifyOtpDto);
  }

  /**
   * Login
   * POST /users/login
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const ipAddress = this.getIpAddress(req);
    return this.usersService.login(loginDto, ipAddress);
  }

  /**
   * Admin Login - Only for admin users
   * POST /users/admin/login
   */
  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto, @Request() req) {
    const ipAddress = this.getIpAddress(req);
    return this.usersService.adminLogin(adminLoginDto, ipAddress);
  }

  /**
   * Logout
   * POST /users/logout/:id
   */
  @Post('logout/:id')
  async logout(@Param('id') id: string) {
    return this.usersService.logout(Number(id));
  }

  /**
   * Forgot password
   * POST /users/forgot-password
   */
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Reset password
   * POST /users/reset-password
   */
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  /**
   * Get user profile
   * GET /users/:id
   */
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(Number(id));
  }

  /**
   * Get user profile (Alias)
   * GET /users/get-profile/:id
   */
  @Get('get-profile/:id')
  async getProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(Number(id));
  }

  /**
   * Update user profile
   * PATCH /users/:id
   */
  @Patch(':id')
  async updateUserProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserProfile(Number(id), updateUserDto);
  }

  /**
   * Helper: Get client IP address
   */
  private getIpAddress(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded 
      ? forwarded.split(',')[0].trim() 
      : req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
    return ip;
  }
}
