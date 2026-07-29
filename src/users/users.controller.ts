import { Controller, Get, Post, Body, Param, Patch, Delete, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto, LoginDto, GoogleLoginDto, VerifyOtpDto, ResendOtpDto, ForgotPasswordDto, ResetPasswordDto, UpdateUserDto, AdminLoginDto, MobileLoginDto, VerifyMobileOtpDto } from './dto/user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * Register a new user
   * POST /users/register
   */
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  /**
   * Get all users (Admin)
   * GET /users
   */
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Verify OTP
   * POST /users/verify-otp
   */
  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.usersService.verifyOtp(verifyOtpDto);
  }

  /**
   * Resend OTP
   * POST /users/resend-otp
   */
  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.usersService.resendOtp(resendOtpDto);
  }

  /**
   * Login
   * POST /users/login
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const ipAddress = this.getIpAddress(req);
    return this.usersService.login(loginDto, ipAddress);
  }

  /**
   * Google Login/Register
   * POST /users/google-login
   */
  @Public()
  @Post('google-login')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto, @Request() req) {
    const ipAddress = this.getIpAddress(req);
    return this.usersService.googleLogin(googleLoginDto, ipAddress);
  }

  /**
   * Admin Login - Only for admin users
   * POST /users/admin/login
   */
  @Public()
  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto, @Request() req) {
    const ipAddress = this.getIpAddress(req);
    return this.usersService.adminLogin(adminLoginDto, ipAddress);
  }

  /**
   * Mobile Login - Request OTP
   * POST /users/mobile-login
   */
  @Public()
  @Post('mobile-login')
  async mobileLogin(@Body() mobileLoginDto: MobileLoginDto) {
    return this.usersService.sendMobileOtp(mobileLoginDto);
  }

  /**
   * Verify Mobile Login - Verify OTP and Login
   * POST /users/verify-mobile-login
   */
  @Public()
  @Post('verify-mobile-login')
  async verifyMobileLogin(@Body() verifyDto: VerifyMobileOtpDto, @Request() req) {
    const ipAddress = this.getIpAddress(req);
    return this.usersService.verifyMobileLogin(verifyDto, ipAddress);
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
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Reset password
   * POST /users/reset-password
   */
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  /**
   * Get all permissions
   * GET /users/permissions/list
   */
  @Get('permissions/list')
  async getAllPermissions() {
    return this.usersService.getAllPermissions();
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
  async updateUserProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: any) {
    const loggedInUser = req.user;
    
    // Only allow updating if it's the user's own profile OR the logged-in user is a Super Master ('1')
    if (String(loggedInUser.userId) !== String(id) && String(loggedInUser.type) !== '1') {
      throw new ForbiddenException('You can only update your own profile');
    }
    
    return this.usersService.updateUserProfile(Number(id), updateUserDto);
  }

  /**
   * Update user role
   * PATCH /users/:id/role
   */
  @Roles('1')
  @Patch(':id/role')
  async updateUserRole(@Param('id') id: string, @Body('type') type: string) {
    return this.usersService.updateUserRole(Number(id), type);
  }

  /**
   * Update user permissions
   * PATCH /users/:id/permissions
   */
  @Roles('1')
  @Patch(':id/permissions')
  async updateUserPermissions(@Param('id') id: string, @Body('permissionIds') permissionIds: number[]) {
    return this.usersService.updateUserPermissions(Number(id), permissionIds);
  }

  /**
   * Toggle user lock
   * PATCH /users/:id/lock
   */
  @Roles('1')
  @Patch(':id/lock')
  async toggleUserLock(@Param('id') id: string, @Body('is_locked') is_locked: boolean) {
    return this.usersService.toggleUserLock(Number(id), is_locked);
  }

  /**
   * Delete user (Admin)
   * DELETE /users/:id
   */
  @Roles('1')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
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
