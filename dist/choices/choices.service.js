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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const choice_entity_1 = require("./entities/choice.entity");
let ChoicesService = class ChoicesService {
    constructor(choicesRepository) {
        this.choicesRepository = choicesRepository;
    }
    async findAll(sceneId) {
        const query = this.choicesRepository.createQueryBuilder('choice')
            .leftJoinAndSelect('choice.targetScene', 'targetScene')
            .orderBy('choice.choice_id', 'ASC');
        if (sceneId) {
            query.where('choice.scene_id = :sceneId', { sceneId });
        }
        return query.getMany();
    }
    async findOne(id) {
        const choice = await this.choicesRepository.findOne({
            where: { choice_id: id },
        });
        if (!choice) {
            throw new common_1.NotFoundException(`Choice with ID ${id} not found`);
        }
        return choice;
    }
    async create(createChoiceDto) {
        const choice = this.choicesRepository.create(createChoiceDto);
        const saved = await this.choicesRepository.save(choice);
        return this.findOne(saved.choice_id);
    }
    async update(updateChoiceDto) {
        const { choice_id } = updateChoiceDto, updateData = __rest(updateChoiceDto, ["choice_id"]);
        await this.choicesRepository.update(choice_id, updateData);
        return this.findOne(choice_id);
    }
    async remove(id) {
        const result = await this.choicesRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Choice with ID ${id} not found`);
        }
    }
};
exports.ChoicesService = ChoicesService;
exports.ChoicesService = ChoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(choice_entity_1.Choice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ChoicesService);
//# sourceMappingURL=choices.service.js.map