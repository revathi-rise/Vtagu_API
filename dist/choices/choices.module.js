"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoicesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const choices_service_1 = require("./choices.service");
const choices_controller_1 = require("./choices.controller");
const choice_entity_1 = require("./entities/choice.entity");
const scene_entity_1 = require("../scenes/entities/scene.entity");
let ChoicesModule = class ChoicesModule {
};
exports.ChoicesModule = ChoicesModule;
exports.ChoicesModule = ChoicesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([choice_entity_1.Choice, scene_entity_1.Scene])],
        providers: [choices_service_1.ChoicesService],
        controllers: [choices_controller_1.ChoicesController],
    })
], ChoicesModule);
//# sourceMappingURL=choices.module.js.map