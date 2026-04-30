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
exports.Scene = void 0;
const typeorm_1 = require("typeorm");
const movie_entity_1 = require("../../movies/movie.entity");
const choice_entity_1 = require("../../choices/entities/choice.entity");
let Scene = class Scene {
};
exports.Scene = Scene;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Scene.prototype, "scene_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Scene.prototype, "movie_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scence_name' }),
    __metadata("design:type", String)
], Scene.prototype, "scene_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scence_url' }),
    __metadata("design:type", String)
], Scene.prototype, "scene_url", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => movie_entity_1.Movie),
    (0, typeorm_1.JoinColumn)({ name: 'movie_id' }),
    __metadata("design:type", movie_entity_1.Movie)
], Scene.prototype, "movie", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => choice_entity_1.Choice, (choice) => choice.scene),
    __metadata("design:type", Array)
], Scene.prototype, "choices", void 0);
exports.Scene = Scene = __decorate([
    (0, typeorm_1.Entity)('interactive_scenes')
], Scene);
//# sourceMappingURL=scene.entity.js.map