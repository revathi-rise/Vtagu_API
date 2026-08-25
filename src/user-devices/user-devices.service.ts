import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDevice } from './entities/user-device.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { CreateUserDeviceDto, UpdateUserDeviceDto, UserDeviceResponseDto, UserDeviceStatusDto } from './dto/user-device.dto';

@Injectable()
export class UserDevicesService {
  constructor(
    @InjectRepository(UserDevice)
    private userDeviceRepository: Repository<UserDevice>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  /**
   * Helper: Get allowed devices limit for a user based on active subscription plan
   */
  async getUserDeviceLimit(userId: number): Promise<number> {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const activeSubs = await this.subscriptionRepository.find({
      where: { userId, status: 1 },
    });

    let maxScreens = 0;
    let hasActiveSubscription = false;
    for (const sub of activeSubs) {
      if (sub.payment_status === 2 && sub.timestamp_from <= currentTimestamp && sub.timestamp_to >= currentTimestamp) {
        const plan = await this.planRepository.findOne({ where: { planId: sub.planId } });
        if (plan) {
          hasActiveSubscription = true;
          if (plan.screens > maxScreens) {
            maxScreens = plan.screens;
          }
        }
      }
    }

    // Default to 1 screen if unsubscribed or plan screens is 0
    return hasActiveSubscription ? (maxScreens > 0 ? maxScreens : 1) : 1;
  }

  /**
   * Get user device limit status and active devices
   */
  async getUserDeviceStatus(userId: number): Promise<{ status: boolean; message: string; data: UserDeviceStatusDto }> {
    try {
      const allowedDevices = await this.getUserDeviceLimit(userId);
      const activeDevices = await this.userDeviceRepository.find({
        where: { userId, is_active: true },
        order: { last_active: 'DESC' },
      });

      const activeCount = activeDevices.length;
      const canRegisterNewDevice = activeCount < allowedDevices;

      return {
        status: true,
        message: 'User device status fetched successfully',
        data: {
          allowedDevices,
          activeCount,
          canRegisterNewDevice,
          activeDevices: activeDevices.map(d => this.mapToResponse(d)),
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Register a new device
   */
  async registerDevice(createUserDeviceDto: CreateUserDeviceDto): Promise<{ status: boolean; message: string; data: UserDeviceResponseDto; deviceLimit?: number; activeCount?: number }> {
    try {
      // Check if device already exists for this user
      const existingDevice = await this.userDeviceRepository.findOne({
        where: { userId: createUserDeviceDto.userId, device_id: createUserDeviceDto.device_id },
      });

      if (existingDevice) {
        // Re-activating/updating an existing device is always allowed
        Object.assign(existingDevice, createUserDeviceDto);
        existingDevice.last_active = new Date();
        existingDevice.is_active = true;
        const updated = await this.userDeviceRepository.save(existingDevice);
        return {
          status: true,
          message: 'Device updated successfully',
          data: this.mapToResponse(updated),
        };
      }

      // For NEW device registration, check allowed device limit based on plan
      const allowedDevices = await this.getUserDeviceLimit(createUserDeviceDto.userId);
      const activeDevicesCount = await this.userDeviceRepository.count({
        where: { userId: createUserDeviceDto.userId, is_active: true },
      });

      if (activeDevicesCount >= allowedDevices) {
        throw new BadRequestException(
          `DEVICE_LIMIT_EXCEEDED: Maximum allowed devices (${allowedDevices}) reached for your subscription plan. Please deactivate an existing device before registering a new device.`
        );
      }

      const device = this.userDeviceRepository.create(createUserDeviceDto);
      device.is_active = true;
      device.last_active = new Date();

      const savedDevice = await this.userDeviceRepository.save(device);
      return {
        status: true,
        message: 'Device registered successfully',
        data: this.mapToResponse(savedDevice),
        deviceLimit: allowedDevices,
        activeCount: activeDevicesCount + 1,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get all devices for a user
   */
  async getDevicesForUser(userId: number): Promise<{ status: boolean; message: string; data: UserDeviceResponseDto[] }> {
    try {
      const devices = await this.userDeviceRepository.find({
        where: { userId },
        order: { created_at: 'DESC' },
      });

      return {
        status: true,
        message: 'Devices fetched successfully',
        data: devices.map(d => this.mapToResponse(d)),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get active devices for a user
   */
  async getActiveDevices(userId: number): Promise<{ status: boolean; message: string; data: UserDeviceResponseDto[] }> {
    try {
      const devices = await this.userDeviceRepository.find({
        where: { userId, is_active: true },
        order: { last_active: 'DESC' },
      });

      return {
        status: true,
        message: 'Active devices fetched successfully',
        data: devices.map(d => this.mapToResponse(d)),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get single device
   */
  async getDevice(deviceId: number): Promise<{ status: boolean; message: string; data: UserDeviceResponseDto }> {
    try {
      const device = await this.userDeviceRepository.findOne({
        where: { id: deviceId },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      return {
        status: true,
        message: 'Device fetched successfully',
        data: this.mapToResponse(device),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update device
   */
  async updateDevice(deviceId: number, updateUserDeviceDto: UpdateUserDeviceDto): Promise<{ status: boolean; message: string; data: UserDeviceResponseDto }> {
    try {
      const device = await this.userDeviceRepository.findOne({
        where: { id: deviceId },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      Object.assign(device, updateUserDeviceDto);
      const updatedDevice = await this.userDeviceRepository.save(device);

      return {
        status: true,
        message: 'Device updated successfully',
        data: this.mapToResponse(updatedDevice),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Deactivate device
   */
  async deactivateDevice(deviceId: number): Promise<{ status: boolean; message: string }> {
    try {
      const device = await this.userDeviceRepository.findOne({
        where: { id: deviceId },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      device.is_active = false;
      await this.userDeviceRepository.save(device);

      return { status: true, message: 'Device deactivated successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Remove device
   */
  async removeDevice(deviceId: number): Promise<{ status: boolean; message: string }> {
    try {
      const device = await this.userDeviceRepository.findOne({
        where: { id: deviceId },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      await this.userDeviceRepository.delete(deviceId);
      return { status: true, message: 'Device removed successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Logout all other devices
   */
  async logoutOtherDevices(userId: number, exceptDeviceId: string): Promise<{ status: boolean; message: string }> {
    try {
      const devices = await this.userDeviceRepository.find({
        where: { userId },
      });

      for (const device of devices) {
        if (device.device_id !== exceptDeviceId) {
          device.is_active = false;
          await this.userDeviceRepository.save(device);
        }
      }

      return { status: true, message: 'All other devices logged out successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Helper: Map entity to response
   */
  private mapToResponse(device: UserDevice): UserDeviceResponseDto {
    return {
      id: device.id,
      userId: device.userId,
      device_id: device.device_id,
      device_name: device.device_name,
      device_type: device.device_type,
      os: device.os,
      os_version: device.os_version,
      ip_address: device.ip_address,
      is_active: device.is_active,
      last_active: device.last_active,
      created_at: device.created_at,
    };
  }
}
