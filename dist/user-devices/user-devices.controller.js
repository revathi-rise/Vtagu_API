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
exports.UserDevicesController = void 0;
const common_1 = require("@nestjs/common");
const user_devices_service_1 = require("./user-devices.service");
const user_device_dto_1 = require("./dto/user-device.dto");
let UserDevicesController = class UserDevicesController {
    constructor(userDevicesService) {
        this.userDevicesService = userDevicesService;
    }
    async registerDevice(createUserDeviceDto) {
        return this.userDevicesService.registerDevice(createUserDeviceDto);
    }
    async getDevicesForUser(userId) {
        return this.userDevicesService.getDevicesForUser(Number(userId));
    }
    async getActiveDevices(userId) {
        return this.userDevicesService.getActiveDevices(Number(userId));
    }
    async getDevice(id) {
        return this.userDevicesService.getDevice(Number(id));
    }
    async updateDevice(id, updateUserDeviceDto) {
        return this.userDevicesService.updateDevice(Number(id), updateUserDeviceDto);
    }
    async deactivateDevice(id) {
        return this.userDevicesService.deactivateDevice(Number(id));
    }
    async removeDevice(id) {
        return this.userDevicesService.removeDevice(Number(id));
    }
    async logoutOtherDevices(userId, deviceId) {
        return this.userDevicesService.logoutOtherDevices(Number(userId), deviceId);
    }
};
exports.UserDevicesController = UserDevicesController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_device_dto_1.CreateUserDeviceDto]),
    __metadata("design:returntype", Promise)
], UserDevicesController.prototype, "registerDevice", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserDevicesController.prototype, "getDevicesForUser", null);
__decorate([
    (0, common_1.Get)('user/:userId/active'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserDevicesController.prototype, "getActiveDevices", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserDevicesController.prototype, "getDevice", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_device_dto_1.UpdateUserDeviceDto]),
    __metadata("design:returntype", Promise)
], UserDevicesController.prototype, "updateDevice", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserDevicesController.prototype, "deactivateDevice", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserDevicesController.prototype, "removeDevice", null);
__decorate([
    (0, common_1.Post)('user/:userId/logout-others/:deviceId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserDevicesController.prototype, "logoutOtherDevices", null);
exports.UserDevicesController = UserDevicesController = __decorate([
    (0, common_1.Controller)('user-devices'),
    __metadata("design:paramtypes", [user_devices_service_1.UserDevicesService])
], UserDevicesController);
//# sourceMappingURL=user-devices.controller.js.map