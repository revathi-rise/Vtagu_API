"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDevicesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_devices_service_1 = require("./user-devices.service");
const user_devices_controller_1 = require("./user-devices.controller");
const user_device_entity_1 = require("./entities/user-device.entity");
let UserDevicesModule = class UserDevicesModule {
};
exports.UserDevicesModule = UserDevicesModule;
exports.UserDevicesModule = UserDevicesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_device_entity_1.UserDevice])],
        controllers: [user_devices_controller_1.UserDevicesController],
        providers: [user_devices_service_1.UserDevicesService],
        exports: [user_devices_service_1.UserDevicesService],
    })
], UserDevicesModule);
//# sourceMappingURL=user-devices.module.js.map