import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDevice } from './entities/user-device.entity';
import { CreateUserDeviceDto, UpdateUserDeviceDto, UserDeviceResponseDto } from './dto/user-device.dto';

@Injectable()
export class UserDevicesService {
  constructor(
    @InjectRepository(UserDevice)
    private userDeviceRepository: Repository<UserDevice>,
  ) {}

  /**
   * Register a new device
   */
  async registerDevice(createUserDeviceDto: CreateUserDeviceDto): Promise<{ status: boolean; message: string; data: UserDeviceResponseDto }> {
    try {
      // Check if device already exists
      const existingDevice = await this.userDeviceRepository.findOne({
        where: { userId: createUserDeviceDto.userId, device_id: createUserDeviceDto.device_id },
      });

      if (existingDevice) {
        // Update existing device
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

      const device = this.userDeviceRepository.create(createUserDeviceDto);
      device.is_active = true;
      device.last_active = new Date();

      const savedDevice = await this.userDeviceRepository.save(device);
      return {
        status: true,
        message: 'Device registered successfully',
        data: this.mapToResponse(savedDevice),
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
      is_active: device.is_active,
      last_active: device.last_active,
      created_at: device.created_at,
    };
  }
}
