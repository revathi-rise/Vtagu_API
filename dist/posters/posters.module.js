"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const posters_controller_1 = require("./posters.controller");
const posters_service_1 = require("./posters.service");
const poster_entity_1 = require("./poster.entity");
let PostersModule = class PostersModule {
};
exports.PostersModule = PostersModule;
exports.PostersModule = PostersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([poster_entity_1.Poster])],
        controllers: [posters_controller_1.PostersController],
        providers: [posters_service_1.PostersService],
    })
], PostersModule);
//# sourceMappingURL=posters.module.js.map