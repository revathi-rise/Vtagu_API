"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDevicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_device_entity_1 = require("./entities/user-device.entity");
let UserDevicesService = class UserDevicesService {
    constructor(userDeviceRepository) {
        this.userDeviceRepository = userDeviceRepository;
    }
    async registerDevice(createUserDeviceDto) {
        try {
            const existingDevice = await this.userDeviceRepository.findOne({
                where: { userId: createUserDeviceDto.userId, device_id: createUserDeviceDto.device_id },
            });
            if (existingDevice) {
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
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getDevicesForUser(userId) {
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
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getActiveDevices(userId) {
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
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getDevice(deviceId) {
        try {
            const device = await this.userDeviceRepository.findOne({
                where: { id: deviceId },
            });
            if (!device) {
                throw new common_1.NotFoundException('Device not found');
            }
            return {
                status: true,
                message: 'Device fetched successfully',
                data: this.mapToResponse(device),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async updateDevice(deviceId, updateUserDeviceDto) {
        try {
            const device = await this.userDeviceRepository.findOne({
                where: { id: deviceId },
            });
            if (!device) {
                throw new common_1.NotFoundException('Device not found');
            }
            Object.assign(device, updateUserDeviceDto);
            const updatedDevice = await this.userDeviceRepository.save(device);
            return {
                status: true,
                message: 'Device updated successfully',
                data: this.mapToResponse(updatedDevice),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async deactivateDevice(deviceId) {
        try {
            const device = await this.userDeviceRepository.findOne({
                where: { id: deviceId },
            });
            if (!device) {
                throw new common_1.NotFoundException('Device not found');
            }
            device.is_active = false;
            await this.userDeviceRepository.save(device);
            return { status: true, message: 'Device deactivated successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async removeDevice(deviceId) {
        try {
            const device = await this.userDeviceRepository.findOne({
                where: { id: deviceId },
            });
            if (!device) {
                throw new common_1.NotFoundException('Device not found');
            }
            await this.userDeviceRepository.delete(deviceId);
            return { status: true, message: 'Device removed successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async logoutOtherDevices(userId, exceptDeviceId) {
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
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    mapToResponse(device) {
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
};
exports.UserDevicesService = UserDevicesService;
exports.UserDevicesService = UserDevicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_device_entity_1.UserDevice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserDevicesService);
//# sourceMappingURL=user-devices.service.js.map