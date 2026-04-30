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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Choice = void 0;
const typeorm_1 = require("typeorm");
const scene_entity_1 = require("../../scenes/entities/scene.entity");
let Choice = class Choice {
};
exports.Choice = Choice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Choice.prototype, "choice_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Choice.prototype, "scene_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Choice.prototype, "button_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Choice.prototype, "target_scene", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => scene_entity_1.Scene, (scene) => scene.choices),
    (0, typeorm_1.JoinColumn)({ name: 'scene_id' }),
    __metadata("design:type", scene_entity_1.Scene)
], Choice.prototype, "scene", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => scene_entity_1.Scene),
    (0, typeorm_1.JoinColumn)({ name: 'target_scene' }),
    __metadata("design:type", scene_entity_1.Scene)
], Choice.prototype, "targetScene", void 0);
exports.Choice = Choice = __decorate([
    (0, typeorm_1.Entity)('interactive_choices')
], Choice);
//# sourceMappingURL=choice.entity.js.map