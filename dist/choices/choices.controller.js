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
exports.ChoicesController = void 0;
const common_1 = require("@nestjs/common");
const choices_service_1 = require("./choices.service");
const choice_dto_1 = require("./dto/choice.dto");
let ChoicesController = class ChoicesController {
    constructor(choicesService) {
        this.choicesService = choicesService;
    }
    async findAll(sceneId, id) {
        if (id) {
            return this.choicesService.findOne(+id);
        }
        const scene_id = sceneId ? +sceneId : undefined;
        return this.choicesService.findAll(scene_id);
    }
    async create(createChoiceDto) {
        return this.choicesService.create(createChoiceDto);
    }
    async update(updateChoiceDto) {
        return this.choicesService.update(updateChoiceDto);
    }
    async removeWithParam(id) {
        await this.choicesService.remove(id);
        return { deleted: true };
    }
    async remove(choiceId, id) {
        const targetId = choiceId || id;
        if (!targetId) {
            return { error: 'choice_id required' };
        }
        await this.choicesService.remove(targetId);
        return { deleted: true };
    }
};
exports.ChoicesController = ChoicesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('scene_id')),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [choice_dto_1.CreateChoiceDto]),
    __metadata("design:returntype", Promise)
], ChoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [choice_dto_1.UpdateChoiceDto]),
    __metadata("design:returntype", Promise)
], ChoicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChoicesController.prototype, "removeWithParam", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Body)('choice_id')),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChoicesController.prototype, "remove", null);
exports.ChoicesController = ChoicesController = __decorate([
    (0, common_1.Controller)('choices'),
    __metadata("design:paramtypes", [choices_service_1.ChoicesService])
], ChoicesController);
//# sourceMappingURL=choices.controller.js.map