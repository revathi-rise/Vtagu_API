import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { UserDevicesService } from './user-devices.service';
import { CreateUserDeviceDto, UpdateUserDeviceDto } from './dto/user-device.dto';

@Controller('user-devices')
export class UserDevicesController {
  constructor(private readonly userDevicesService: UserDevicesService) {}

  /**
   * Register a new device
   * POST /user-devices/register
   */
  @Post('register')
  async registerDevice(@Body() createUserDeviceDto: CreateUserDeviceDto) {
    return this.userDevicesService.registerDevice(createUserDeviceDto);
  }

  /**
   * Get all devices for user
   * GET /user-devices/user/:userId
   */
  @Get('user/:userId')
  async getDevicesForUser(@Param('userId') userId: string) {
    return this.userDevicesService.getDevicesForUser(Number(userId));
  }

  /**
   * Get active devices for user
   * GET /user-devices/user/:userId/active
   */
  @Get('user/:userId/active')
  async getActiveDevices(@Param('userId') userId: string) {
    return this.userDevicesService.getActiveDevices(Number(userId));
  }

  /**
   * Get single device
   * GET /user-devices/:id
   */
  @Get(':id')
  async getDevice(@Param('id') id: string) {
    return this.userDevicesService.getDevice(Number(id));
  }

  /**
   * Update device
   * PATCH /user-devices/:id
   */
  @Patch(':id')
  async updateDevice(@Param('id') id: string, @Body() updateUserDeviceDto: UpdateUserDeviceDto) {
    return this.userDevicesService.updateDevice(Number(id), updateUserDeviceDto);
  }

  /**
   * Deactivate device
   * POST /user-devices/:id/deactivate
   */
  @Post(':id/deactivate')
  async deactivateDevice(@Param('id') id: string) {
    return this.userDevicesService.deactivateDevice(Number(id));
  }

  /**
   * Remove device
   * DELETE /user-devices/:id
   */
  @Delete(':id')
  async removeDevice(@Param('id') id: string) {
    return this.userDevicesService.removeDevice(Number(id));
  }

  /**
   * Logout all other devices
   * POST /user-devices/user/:userId/logout-others/:deviceId
   */
  @Post('user/:userId/logout-others/:deviceId')
  async logoutOtherDevices(@Param('userId') userId: string, @Param('deviceId') deviceId: string) {
    return this.userDevicesService.logoutOtherDevices(Number(userId), deviceId);
  }
}
