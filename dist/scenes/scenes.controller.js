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
exports.ScenesController = void 0;
const common_1 = require("@nestjs/common");
const scenes_service_1 = require("./scenes.service");
let ScenesController = class ScenesController {
    constructor(scenesService) {
        this.scenesService = scenesService;
    }
    async findByMovie(id) {
        const scenes = await this.scenesService.findByMovieId(id);
        return {
            status: 'success',
            total_count: scenes.length,
            data: scenes,
        };
    }
};
exports.ScenesController = ScenesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ScenesController.prototype, "findByMovie", null);
exports.ScenesController = ScenesController = __decorate([
    (0, common_1.Controller)('scenes'),
    __metadata("design:paramtypes", [scenes_service_1.ScenesService])
], ScenesController);
//# sourceMappingURL=scenes.controller.js.map